-- Add settings columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS strict_timer BOOLEAN DEFAULT true;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS immediate_results BOOLEAN DEFAULT false;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS proctoring_mode BOOLEAN DEFAULT false;

-- Create exam_access_codes table
CREATE TABLE IF NOT EXISTS exam_access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'redeemed')),
    redeemed_by_student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, code)
);

-- Enable RLS
ALTER TABLE exam_access_codes ENABLE ROW LEVEL SECURITY;

-- Policies for exam_access_codes
CREATE POLICY "Admins can manage access codes"
    ON exam_access_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Students can read unused codes for their exam"
    ON exam_access_codes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'student'
        )
    );
