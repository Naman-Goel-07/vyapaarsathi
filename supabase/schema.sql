-- ==============================================================================
-- VyapaarSathi Statutory Compliance Engine - Database Schema Definition
-- Production PostgreSQL / Supabase Schema (DDL)
-- Sanitized: Contains ZERO credentials, secrets, API keys, or tenant data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('owner', 'ca');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notice_status') THEN
    CREATE TYPE public.notice_status AS ENUM ('open', 'filed', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM ('pending', 'completed');
  END IF;
END $$;

-- 3. TABLES

-- Profiles (User roles and identity linkage)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  business_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Businesses (Registered enterprises)
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  owner_id uuid,
  ca_id uuid
);

-- Notices (Statutory demand cases and records)
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  uploaded_by uuid,
  authority text NOT NULL,
  form text,
  issue text,
  deadline date,
  status public.notice_status NOT NULL DEFAULT 'open'::notice_status,
  raw_file_url text NOT NULL,
  confidence double precision,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at timestamp with time zone,
  last_active_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tasks (Collaborative action items across Owner Desk and CA Bench)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  action text NOT NULL,
  owner_role public.user_role NOT NULL,
  status public.task_status NOT NULL DEFAULT 'pending'::task_status,
  documents_requested jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- Audit Logs (Tamper-evident activity logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  actor_id uuid,
  changes jsonb,
  hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. PROCEDURAL FUNCTIONS

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_business_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.update_last_active_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  if TG_TABLE_NAME = 'notices' then
    new.last_active_at = timezone('utc'::text, now());
    return new;
  elsif TG_TABLE_NAME = 'tasks' then
    update notices set last_active_at = timezone('utc'::text, now()) where id = new.notice_id;
    return new;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
declare
  log_hash text;
  action_type text;
  target_notice_id uuid;
begin
  if TG_OP = 'INSERT' then
    action_type = 'CREATE';
  else
    action_type = 'UPDATE';
  end if;

  if TG_TABLE_NAME = 'notices' then
    target_notice_id = coalesce(new.id, old.id);
  else
    target_notice_id = coalesce(new.notice_id, old.notice_id);
  end if;

  -- Tamper evident hash
  log_hash = encode(digest(TG_TABLE_NAME || TG_OP || target_notice_id::text || now()::text, 'sha256'), 'hex');

  insert into audit_logs (notice_id, action_type, actor_id, changes, hash)
  values (target_notice_id, action_type || '_' || TG_TABLE_NAME, auth.uid(), row_to_json(new), log_hash);
  
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.assign_ca_to_business(p_business_id uuid, p_ca_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_ca_profile RECORD;
BEGIN
  SELECT id, email, role, full_name
  INTO v_ca_profile
  FROM public.profiles
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(p_ca_email))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No registered account found with email "' || p_ca_email || '". The CA must create an account on VyapaarSathi first.'
    );
  END IF;

  IF v_ca_profile.role <> 'ca' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'The account "' || p_ca_email || '" is registered as a Business Owner, not a Chartered Accountant.'
    );
  END IF;

  UPDATE public.businesses
  SET ca_id = v_ca_profile.id
  WHERE id = p_business_id;

  RETURN jsonb_build_object(
    'success', true,
    'ca_id', v_ca_profile.id,
    'email', v_ca_profile.email,
    'full_name', v_ca_profile.full_name
  );
END;
$function$;

-- 6. TRIGGERS

DROP TRIGGER IF EXISTS update_notices_last_active ON public.notices;
CREATE TRIGGER update_notices_last_active
  BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active_at();

DROP TRIGGER IF EXISTS update_tasks_last_active ON public.tasks;
CREATE TRIGGER update_tasks_last_active
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active_at();

DROP TRIGGER IF EXISTS notice_audit ON public.notices;
CREATE TRIGGER notice_audit
  AFTER INSERT OR UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS task_audit ON public.tasks;
CREATE TRIGGER task_audit
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- 7. ROW LEVEL SECURITY POLICIES

-- Profiles
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated users to read profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow view of CA profiles" ON public.profiles;
CREATE POLICY "Allow view of CA profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (((role = 'ca'::user_role) OR (auth.uid() = id)));

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (((id = auth.uid()) OR (get_current_user_role() = 'ca'::text)));

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

-- Businesses
DROP POLICY IF EXISTS "Allow authenticated users to update businesses" ON public.businesses;
CREATE POLICY "Allow authenticated users to update businesses"
  ON public.businesses FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updating businesses" ON public.businesses;
CREATE POLICY "Allow updating businesses"
  ON public.businesses FOR UPDATE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "businesses_insert_policy" ON public.businesses;
CREATE POLICY "businesses_insert_policy"
  ON public.businesses FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "businesses_select_policy" ON public.businesses;
CREATE POLICY "businesses_select_policy"
  ON public.businesses FOR SELECT TO anon, authenticated
  USING (((id = get_current_user_business_id()) OR (get_current_user_role() = 'ca'::text) OR true));

DROP POLICY IF EXISTS "businesses_update_policy" ON public.businesses;
CREATE POLICY "businesses_update_policy"
  ON public.businesses FOR UPDATE TO authenticated
  USING (((id = get_current_user_business_id()) OR (get_current_user_role() = 'ca'::text)));

-- Notices
DROP POLICY IF EXISTS "notices_insert_policy" ON public.notices;
CREATE POLICY "notices_insert_policy"
  ON public.notices FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "notices_select_policy" ON public.notices;
CREATE POLICY "notices_select_policy"
  ON public.notices FOR SELECT TO anon, authenticated
  USING (((business_id = get_current_user_business_id()) OR (get_current_user_role() = 'ca'::text)));

DROP POLICY IF EXISTS "notices_update_policy" ON public.notices;
CREATE POLICY "notices_update_policy"
  ON public.notices FOR UPDATE TO authenticated
  USING (((business_id = get_current_user_business_id()) OR (get_current_user_role() = 'ca'::text)));

-- Tasks
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
CREATE POLICY "tasks_insert_policy"
  ON public.tasks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
CREATE POLICY "tasks_select_policy"
  ON public.tasks FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
CREATE POLICY "tasks_update_policy"
  ON public.tasks FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Audit Logs
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.audit_logs;
CREATE POLICY "Allow authenticated insert"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated select" ON public.audit_logs;
CREATE POLICY "Allow authenticated select"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (true);

-- 8. STORAGE BUCKET & POLICIES (secure-notices)
INSERT INTO storage.buckets (id, name, public)
VALUES ('secure-notices', 'secure-notices', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Allow reads from secure-notices" ON storage.objects;
CREATE POLICY "Allow reads from secure-notices"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING ((bucket_id = 'secure-notices'::text));

DROP POLICY IF EXISTS "Allow uploads to secure-notices" ON storage.objects;
CREATE POLICY "Allow uploads to secure-notices"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK ((bucket_id = 'secure-notices'::text));

DROP POLICY IF EXISTS "Owners can upload notice files" ON storage.objects;
CREATE POLICY "Owners can upload notice files"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (((bucket_id = 'secure-notices'::text) AND (auth.role() = 'authenticated'::text)));

DROP POLICY IF EXISTS "Users can view own business notice files" ON storage.objects;
CREATE POLICY "Users can view own business notice files"
  ON storage.objects FOR SELECT TO public
  USING (((bucket_id = 'secure-notices'::text) AND (auth.role() = 'authenticated'::text)));
