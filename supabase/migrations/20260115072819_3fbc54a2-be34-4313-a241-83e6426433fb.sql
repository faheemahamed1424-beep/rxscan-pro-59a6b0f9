-- Create prescriptions table for storing scan history
CREATE TABLE public.prescriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score FLOAT,
    raw_text TEXT,
    image_url TEXT,
    scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own prescriptions
CREATE POLICY "Users can view their own prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
ON public.prescriptions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
ON public.prescriptions FOR DELETE
USING (auth.uid() = user_id);

-- Create private storage bucket for prescription images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescription_images', 'prescription_images', false);

-- Storage policies: Users can only access their own folder
CREATE POLICY "Users can view their own prescription images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prescription_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own prescription images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prescription_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own prescription images"
ON storage.objects FOR DELETE
USING (bucket_id = 'prescription_images' AND (storage.foldername(name))[1] = auth.uid()::text);