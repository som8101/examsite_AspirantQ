'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateExamSchema = z.object({
  title: z.string().min(3),
  description: z.string().nullish(),
  category: z.string().nullish(),
  subject: z.string().nullish(),
  year: z.string().nullish(),
  total_questions: z.coerce.number().min(1),
  marks_per_question: z.coerce.number().min(1),
  negative_marks: z.coerce.number().min(0),
  duration_minutes: z.coerce.number().min(1),
  instructions: z.string().nullish(),
  schedule_type: z.enum(['immediate', 'scheduled']),
  scheduled_start_at: z.string().nullish(),
  scheduled_end_at: z.string().nullish(),
  access_code: z.string().nullish(),
});

export async function createExamAction(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { message: 'Unauthorized', error: true };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      subject: formData.get('subject'),
      year: formData.get('year'),
      total_questions: formData.get('total_questions'),
      marks_per_question: formData.get('marks_per_question'),
      negative_marks: formData.get('negative_marks'),
      duration_minutes: formData.get('duration_minutes'),
      instructions: formData.get('instructions'),
      schedule_type: formData.get('schedule_type'),
      scheduled_start_at: formData.get('scheduled_start_at') || null,
      scheduled_end_at: formData.get('scheduled_end_at') || null,
      access_code: formData.get('access_code') || null,
    };

    const validated = CreateExamSchema.parse(rawData);

    let scheduledEndAt = validated.scheduled_end_at ? new Date(validated.scheduled_end_at).toISOString() : null;
    let scheduledStartAt = validated.scheduled_start_at;
    
    if (validated.schedule_type === 'scheduled' && validated.scheduled_start_at) {
      const start = new Date(validated.scheduled_start_at);
      scheduledStartAt = start.toISOString();
    }

    const slug = validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { data, error } = await supabase.from('exams').insert({
      ...validated,
      scheduled_start_at: scheduledStartAt,
      slug,
      scheduled_end_at: scheduledEndAt,
      created_by: user.id,
      status: 'draft'
    }).select().single();

    if (error) {
      console.error("DB Error:", error);
      return { message: error.message || 'Failed to create exam', error: true };
    }

    return { redirectUrl: `/admin/exams/${data.id}/import` };
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { message: 'Validation failed: ' + (error.issues[0]?.message || 'Invalid input'), error: true };
    }
    return { message: error.message || 'An unexpected error occurred', error: true };
  }
}

export async function updateExamAction(examId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { message: 'Unauthorized', error: true };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      subject: formData.get('subject'),
      year: formData.get('year'),
      total_questions: formData.get('total_questions'),
      marks_per_question: formData.get('marks_per_question'),
      negative_marks: formData.get('negative_marks'),
      duration_minutes: formData.get('duration_minutes'),
      instructions: formData.get('instructions'),
      schedule_type: formData.get('schedule_type'),
      scheduled_start_at: formData.get('scheduled_start_at') || null,
      scheduled_end_at: formData.get('scheduled_end_at') || null,
      access_code: formData.get('access_code') || null,
    };

    const validated = CreateExamSchema.parse(rawData);

    let scheduledEndAt = validated.scheduled_end_at ? new Date(validated.scheduled_end_at).toISOString() : null;
    let scheduledStartAt = validated.scheduled_start_at;
    
    if (validated.schedule_type === 'scheduled' && validated.scheduled_start_at) {
      const start = new Date(validated.scheduled_start_at);
      scheduledStartAt = start.toISOString();
    }

    const { error } = await supabase.from('exams').update({
      ...validated,
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt,
    }).eq('id', examId);

    if (error) {
      return { message: error.message || 'Failed to update exam', error: true };
    }

    revalidatePath(`/admin/exams/${examId}`);
    return { redirectUrl: `/admin/exams/${examId}` };
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { message: 'Validation failed: ' + (error.issues[0]?.message || 'Invalid input'), error: true };
    }
    return { message: error.message || 'An unexpected error occurred', error: true };
  }
}

export async function deleteQuestionAction(questionId: string, examId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Unauthorized', error: true };

    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) return { message: error.message, error: true };

    revalidatePath(`/admin/exams/${examId}/review`);
    return { success: true };
  } catch (error: any) {
    return { message: error.message, error: true };
  }
}

export async function duplicateExamAction(examId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Unauthorized', error: true };

    const { data: original, error: fetchErr } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (fetchErr || !original) return { message: 'Exam not found', error: true };
    
    const { id, created_at, updated_at, ...rest } = original;
    const slug = original.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-copy-' + Date.now();
    
    const { data, error } = await supabase.from('exams').insert({
       ...rest,
       title: `${original.title} (Copy)`,
       slug,
       status: 'draft',
       created_by: user.id
    }).select().single();
    
    if (error) return { message: error.message, error: true };
    
    // redirect to the newly duplicated exam
    redirect(`/admin/exams/${data.id}`);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') {
       throw error;
    }
    return { message: error.message, error: true };
  }
}
