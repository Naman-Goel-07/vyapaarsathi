begin;

-- Enrollment is separate from the existing business assignment. Browser clients
-- cannot add or change an approved account or business.
create table public.telegram_pilot_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  primary key (business_id, role)
);
create index telegram_pilot_user on public.telegram_pilot_members (user_id);
alter table public.telegram_pilot_members enable row level security;
revoke all on public.telegram_pilot_members from public, anon, authenticated, service_role;

create function public.telegram_access_role(p_user_id uuid, p_business_id uuid)
returns public.user_role language sql stable set search_path = ''
as $$
  select m.role
  from public.telegram_pilot_members m
  join public.profiles p on p.id = m.user_id and p.role = m.role
  join public.businesses b on b.id = m.business_id
  where m.user_id = p_user_id and m.business_id = p_business_id and (
    (p.role = 'owner' and b.owner_id = p.id and p.business_id = b.id)
    or (p.role = 'ca' and b.ca_id = p.id)
  )
$$;
revoke all on function public.telegram_access_role(uuid, uuid) from public, anon, authenticated, service_role;

create function public.telegram_can_link(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.telegram_pilot_members m
    where m.user_id = p_user and public.telegram_access_role(p_user, m.business_id) = m.role
  )
$$;
revoke all on function public.telegram_can_link(uuid) from public, anon, authenticated;
grant execute on function public.telegram_can_link(uuid) to service_role;

create table public.telegram_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  chat_id bigint not null unique check (chat_id > 0),
  lang text not null check (lang in ('en', 'hi'))
);

create table public.telegram_pairings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  chat_id bigint check (chat_id > 0),
  pin text,
  attempts integer not null default 0,
  lang text not null check (lang in ('en', 'hi'))
);

create table public.telegram_outbox (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.telegram_accounts(id) on delete cascade,
  notice_id uuid not null references public.notices(id) on delete cascade,
  business_id uuid not null,
  recipient_role public.user_role not null,
  event text not null check (event in ('new_notice', 'owner_action', 'owner_completed', 'ca_action', 'filed', 'closed')),
  task_id uuid,
  created_at timestamptz not null default now(),
  available_at timestamptz not null default now(),
  attempts integer not null default 0,
  claim_token uuid
);
create index telegram_outbox_ready on public.telegram_outbox (available_at, created_at);
create index telegram_outbox_account on public.telegram_outbox (account_id);
create index telegram_outbox_notice on public.telegram_outbox (notice_id);

alter table public.telegram_accounts enable row level security;
alter table public.telegram_pairings enable row level security;
alter table public.telegram_outbox enable row level security;
revoke all on public.telegram_accounts, public.telegram_pairings, public.telegram_outbox from public, anon, authenticated;
grant select, insert, update, delete on public.telegram_accounts, public.telegram_pairings, public.telegram_outbox to service_role;

-- First bind the token to a private chat. Retries from the same chat get the same PIN.
create function public.telegram_open_pairing(p_hash text, p_chat bigint, p_pin text)
returns table (pin text, lang text) language sql set search_path = ''
as $$
  update public.telegram_pairings p
  set chat_id = p_chat, pin = coalesce(p.pin, p_pin)
  where p.token_hash = p_hash and p.expires_at > now() and p.attempts < 5
    and (p.chat_id is null or p.chat_id = p_chat)
    and public.telegram_can_link(p.user_id)
  returning p.pin, p.lang
$$;

create function public.telegram_confirm_pairing(p_user uuid, p_pin text)
returns text language plpgsql set search_path = ''
as $$
declare
  pairing public.telegram_pairings%rowtype;
begin
  select * into pairing from public.telegram_pairings where user_id = p_user for update;
  if not found or pairing.expires_at <= now() or pairing.attempts >= 5 or pairing.pin is null
    or not public.telegram_can_link(p_user) then
    return 'invalid';
  end if;
  if pairing.pin <> p_pin then
    update public.telegram_pairings set attempts = attempts + 1 where user_id = p_user;
    return 'invalid';
  end if;
  insert into public.telegram_accounts(user_id, chat_id, lang) values (p_user, pairing.chat_id, pairing.lang)
    on conflict do nothing;
  if not found then
    return 'conflict';
  end if;
  delete from public.telegram_pairings where user_id = p_user;
  return 'linked';
end;
$$;

create function public.telegram_disconnect(p_user uuid)
returns void language plpgsql set search_path = ''
as $$
begin
  delete from public.telegram_pairings where user_id = p_user;
  delete from public.telegram_accounts where user_id = p_user;
end;
$$;

create function public.telegram_enqueue(
  p_notice uuid, p_business uuid, p_role public.user_role, p_event text, p_task uuid default null
)
returns void language sql set search_path = ''
as $$
  insert into public.telegram_outbox(account_id, notice_id, business_id, recipient_role, event, task_id)
  select a.id, p_notice, b.id, p_role, p_event, p_task
  from public.businesses b
  join public.telegram_accounts a on a.user_id = case when p_role = 'owner' then b.owner_id else b.ca_id end
  where b.id = p_business and public.telegram_access_role(a.user_id, b.id) = p_role
$$;
revoke all on function public.telegram_enqueue(uuid, uuid, public.user_role, text, uuid) from public, anon, authenticated;

create function public.telegram_notice_event()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  actor_role public.user_role;
begin
  actor_role := public.telegram_access_role(auth.uid(), new.business_id);
  if actor_role is null then return new; end if;
  if tg_op = 'INSERT' and new.status = 'open' then
    perform public.telegram_enqueue(new.id, new.business_id, 'owner', 'new_notice');
    perform public.telegram_enqueue(new.id, new.business_id, 'ca', 'new_notice');
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.status in ('filed', 'closed') then
    if actor_role = 'ca' then
      perform public.telegram_enqueue(new.id, new.business_id, 'owner', new.status::text);
    end if;
  end if;
  return new;
end;
$$;

create function public.telegram_task_event()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  case_notice public.notices%rowtype;
  actor_role public.user_role;
  event text;
  recipient public.user_role;
begin
  if tg_op = 'UPDATE' and new.status = old.status and new.owner_role = old.owner_role
    and new.documents_requested is not distinct from old.documents_requested then
    return new;
  end if;
  select * into case_notice from public.notices where id = new.notice_id;
  if not found or case_notice.status <> 'open' then return new; end if;
  actor_role := public.telegram_access_role(auth.uid(), case_notice.business_id);
  if actor_role is null then return new; end if;
  if new.owner_role = 'owner' and new.status = 'pending' and actor_role = 'ca' then
    event := 'owner_action';
    recipient := 'owner';
  elsif new.owner_role = 'owner' and new.status = 'completed' and actor_role = 'owner'
      and (tg_op = 'INSERT' or old.status <> 'completed') then
    event := 'owner_completed';
    recipient := 'ca';
  elsif new.owner_role = 'ca' and new.status = 'pending'
      and (tg_op = 'INSERT' or old.status <> 'pending' or old.owner_role <> 'ca') then
    -- Initial tasks created during intake are already covered by the new-notice alert.
    if tg_op = 'INSERT' and case_notice.created_at > now() - interval '1 minute'
      and not exists (select 1 from public.tasks t where t.notice_id = new.notice_id and t.id <> new.id) then
      return new;
    end if;
    event := 'ca_action';
    recipient := 'ca';
  end if;
  if event is not null then
    perform public.telegram_enqueue(new.notice_id, case_notice.business_id, recipient, event, new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.telegram_notice_event(), public.telegram_task_event() from public, anon, authenticated;

create trigger telegram_notice_event after insert or update of status on public.notices
  for each row execute function public.telegram_notice_event();
create trigger telegram_task_event after insert or update of status, owner_role, documents_requested on public.tasks
  for each row execute function public.telegram_task_event();

create function public.telegram_work(p_account uuid)
returns table (notice_id uuid, business_name text, deadline date, total bigint)
language sql stable security definer set search_path = ''
as $$
  select n.id, b.name, n.deadline, count(*) over ()
  from public.telegram_accounts a
  join public.telegram_pilot_members m on m.user_id = a.user_id
  join public.businesses b on b.id = m.business_id
  join public.notices n on n.business_id = b.id
  where a.id = p_account and public.telegram_access_role(a.user_id, b.id) = m.role
    and n.status = 'open' and (
    (m.role = 'owner') = exists (
      select 1 from public.tasks t where t.notice_id = n.id and t.status = 'pending' and t.owner_role = 'owner'
    )
  )
  order by n.deadline nulls last, n.created_at, n.id
  limit 8
$$;

create function public.telegram_claim(p_token uuid)
returns table (id uuid, attempts integer)
language plpgsql set search_path = ''
as $$
begin
  delete from public.telegram_pairings where expires_at <= now();
  delete from public.telegram_outbox o where o.created_at < now() - interval '7 days'
    or (o.attempts >= 6 and o.available_at <= now());
  return query
    with next_jobs as (
      select o.id from public.telegram_outbox o
      where o.available_at <= now() and o.attempts < 6 and o.id in (
        select distinct on (q.account_id) q.id from public.telegram_outbox q
        where q.available_at <= now() and q.attempts < 6
          and not exists (
            select 1 from public.telegram_outbox active
            where active.account_id = q.account_id and active.claim_token is not null and active.available_at > now()
          )
        order by q.account_id, q.available_at, q.created_at, q.id
      )
      order by o.available_at, o.created_at, o.id
      limit 8 for update skip locked
    )
    update public.telegram_outbox o
    set claim_token = p_token, available_at = now() + interval '2 minutes', attempts = o.attempts + 1
    from next_jobs j where o.id = j.id returning o.id, o.attempts;
end;
$$;

-- Resolve the recipient again immediately before sending. An old CA or a disconnected
-- chat cannot receive queued messages just because they were eligible when queued.
create function public.telegram_delivery(p_id uuid, p_token uuid)
returns table (chat_id text, lang text, event text, recipient_role public.user_role,
  notice_id uuid, business_name text, deadline date)
language sql stable security definer set search_path = ''
as $$
  select a.chat_id::text, a.lang, o.event, o.recipient_role, n.id, b.name, n.deadline
  from public.telegram_outbox o
  join public.telegram_accounts a on a.id = o.account_id
  join public.notices n on n.id = o.notice_id and n.business_id = o.business_id
  join public.businesses b on b.id = n.business_id
  where o.id = p_id and o.claim_token = p_token and o.available_at > now()
    and public.telegram_access_role(a.user_id, b.id) = o.recipient_role
    and (o.event not in ('owner_action', 'ca_action') or (
      n.status = 'open' and exists (
        select 1 from public.tasks t where t.id = o.task_id and t.notice_id = n.id
          and t.status = 'pending' and t.owner_role = o.recipient_role
      )
    ))
$$;

revoke all on function public.telegram_open_pairing(text, bigint, text),
  public.telegram_confirm_pairing(uuid, text), public.telegram_disconnect(uuid),
  public.telegram_work(uuid), public.telegram_claim(uuid), public.telegram_delivery(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.telegram_open_pairing(text, bigint, text),
  public.telegram_confirm_pairing(uuid, text), public.telegram_disconnect(uuid),
  public.telegram_work(uuid), public.telegram_claim(uuid), public.telegram_delivery(uuid, uuid)
  to service_role;

commit;
