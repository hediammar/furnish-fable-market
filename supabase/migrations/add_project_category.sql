-- Add project_category column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'project_category') THEN
        ALTER TABLE public.projects ADD COLUMN project_category text;
    END IF;
END $$; 