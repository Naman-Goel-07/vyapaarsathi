-- Safe Schema Compatibility Migration for VyapaarSathi Statutory Notices
-- Adds penalty_amount and din_number columns to public.notices table if not present

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notices' 
        AND column_name = 'penalty_amount'
    ) THEN
        ALTER TABLE public.notices ADD COLUMN penalty_amount NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notices' 
        AND column_name = 'din_number'
    ) THEN
        ALTER TABLE public.notices ADD COLUMN din_number TEXT DEFAULT NULL;
    END IF;
END $$;

COMMENT ON COLUMN public.notices.penalty_amount IS 'Statutory tax demand / penalty exposure in INR';
COMMENT ON COLUMN public.notices.din_number IS 'Document Identification Number (DIN) issued by statutory authority';
