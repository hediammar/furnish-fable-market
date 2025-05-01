-- Add address and zip_code columns to profiles table if they don't exist

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE public.profiles ADD COLUMN address text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'zip_code') THEN
        ALTER TABLE public.profiles ADD COLUMN zip_code text;
    END IF;
END $$; 