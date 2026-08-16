import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SettingsClient } from './SettingsClient';

export default async function ExamSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: exam, error: examError } = await supabase.from('exams').select('*').eq('id', params.id).single();
  if (examError || !exam) return notFound();
  
  const { data: codes } = await supabase
    .from('exam_access_codes')
    .select(`
      *,
      profiles!redeemed_by_student_id(email, full_name)
    `)
    .eq('exam_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Exam Settings</h1>
          <p className="text-muted-foreground mt-1">Configure access rules and exam behavior for {exam.title}.</p>
        </div>
      </div>

      <SettingsClient exam={exam} initialCodes={codes || []} />
    </div>
  );
}
