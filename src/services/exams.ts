import { createClient } from '@/lib/supabase/server';

export async function getExams(filters?: { status?: string, category?: string }) {
  const supabase = await createClient();
  let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
  
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.category) query = query.eq('category', filters.category);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getExamById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('exams').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createExam(examData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from('exams').insert([{
    ...examData,
    created_by: user.id
  }]).select().single();
  
  if (error) throw error;
  return data;
}

export async function updateExam(id: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('exams').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function publishExam(id: string) {
  const supabase = await createClient();
  const { data: exam } = await supabase.from('exams').select('schedule_type').eq('id', id).single();
  
  const status = exam?.schedule_type === 'scheduled' ? 'scheduled' : 'live';
  
  const { data, error } = await supabase.from('exams').update({ 
    status, 
    published_at: new Date().toISOString() 
  }).eq('id', id).select().single();
  
  if (error) throw error;
  return data;
}
