import { createClient } from '@/lib/supabase/server';

export async function startAttempt(examId: string, accessCode?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: exam, error: examError } = await supabase.from('exams').select('*').eq('id', examId).single();
  if (examError || !exam) throw new Error("Exam not found");
  
  if (exam.status !== 'live') {
    throw new Error("Exam is not currently live");
  }
  
  // Actually, we need to accept an access code parameter if we want to validate it.
  // Wait, startAttempt doesn't take an access code currently.
  // I need to check how startAttempt is called.
  
  const now = new Date();
  const scheduledStart = new Date(exam.scheduled_start_at || now);
  let scheduledEnd = new Date(exam.scheduled_end_at || new Date(now.getTime() + exam.duration_minutes * 60000));
  
  if (now < scheduledStart) {
    throw new Error("Exam has not started yet");
  }
  if (now >= scheduledEnd) {
    throw new Error("Exam has already ended");
  }
  
  const durationMs = exam.duration_minutes * 60000;
  const theoreticalEnd = new Date(now.getTime() + durationMs);
  
  // Important rule: student gets only the remaining time until fixed exam end time
  const expiresAt = theoreticalEnd > scheduledEnd ? scheduledEnd : theoreticalEnd;
  
  const { data: existingAttempt } = await supabase.from('exam_attempts').select('*').eq('exam_id', examId).eq('student_id', user.id).single();
  
  if (existingAttempt) {
    if (existingAttempt.status === 'in_progress') {
       if (now >= new Date(existingAttempt.expires_at)) {
         throw new Error("Attempt expired");
       }
       return existingAttempt;
    } else {
       throw new Error("You have already completed this exam");
    }
  }

  // Check if exam has codes generated (restricted access)
  const { data: codeCheck } = await supabase.from('exam_access_codes').select('id').eq('exam_id', examId).limit(1);
  const requiresCode = codeCheck && codeCheck.length > 0;
  
  if (requiresCode) {
    if (!accessCode) {
      throw new Error("This exam requires an access code.");
    }
    
    // Attempt to redeem the code
    // Check if valid and unused
    const { data: codeData, error: codeErr } = await supabase
      .from('exam_access_codes')
      .select('*')
      .eq('exam_id', examId)
      .eq('code', accessCode)
      .single();
      
    if (codeErr || !codeData) {
      throw new Error("Invalid access code.");
    }
    
    if (codeData.status !== 'unused') {
      if (codeData.redeemed_by_student_id !== user.id) {
         throw new Error("This access code has already been redeemed.");
      }
    } else {
      // Mark as redeemed
      const { error: updateErr } = await supabase
        .from('exam_access_codes')
        .update({
          status: 'redeemed',
          redeemed_by_student_id: user.id,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', codeData.id);
        
      if (updateErr) throw new Error("Failed to redeem access code.");
    }
  }

  const { data, error } = await supabase.from('exam_attempts').insert({
    exam_id: examId,
    student_id: user.id,
    scheduled_start_at: scheduledStart.toISOString(),
    expires_at: expiresAt.toISOString(),
    total_questions: exam.total_questions,
    status: 'in_progress'
  }).select().single();
  
  if (error) throw error;
  return data;
}

export async function saveAnswer(attemptId: string, questionId: string, answer: string | null) {
  const supabase = await createClient();
  const { data: attempt } = await supabase.from('exam_attempts').select('expires_at, status').eq('id', attemptId).single();
  
  if (!attempt || attempt.status !== 'in_progress') {
    throw new Error("Attempt is not in progress");
  }
  
  if (new Date() >= new Date(attempt.expires_at)) {
    throw new Error("Attempt expired");
  }
  
  const { error } = await supabase.from('attempt_answers').upsert({
    attempt_id: attemptId,
    question_id: questionId,
    selected_answer: answer,
    updated_at: new Date().toISOString()
  }, { onConflict: 'attempt_id,question_id' });
  
  if (error) throw error;
  return true;
}
