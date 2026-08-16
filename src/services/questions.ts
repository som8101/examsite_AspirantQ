import { createClient } from '@/lib/supabase/server';

export async function getExamQuestions(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('questions').select('*').eq('exam_id', examId).order('question_number', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateQuestion(id: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('questions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function approveAllVerifiedQuestions(examId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('questions').update({ verification_status: 'verified' }).eq('exam_id', examId).eq('verification_status', 'pending');
  if (error) throw error;
  return true;
}
