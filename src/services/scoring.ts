import { createClient } from '@/lib/supabase/server';

export async function submitAttemptAndScore(attemptId: string) {
  const supabase = await createClient();
  
  const { data: attempt } = await supabase.from('exam_attempts').select('*, exams(total_questions, total_marks)').eq('id', attemptId).single();
  if (!attempt) throw new Error("Attempt not found");
  
  if (attempt.status === 'submitted' || attempt.status === 'auto_submitted') {
    return attempt; // Already scored
  }

  const { data: questions } = await supabase.from('questions').select('id, correct_answer, marks, negative_marks').eq('exam_id', attempt.exam_id);
  const { data: attemptAnswers } = await supabase.from('attempt_answers').select('question_id, selected_answer').eq('attempt_id', attemptId);
  
  const answersMap = new Map();
  attemptAnswers?.forEach(a => answersMap.set(a.question_id, a.selected_answer));
  
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let score = 0;
  
  const updatesToAnswers = [];

  for (const q of (questions || [])) {
    const selected = answersMap.get(q.id);
    let isCorrect = null;
    let marksAwarded = 0;
    
    if (!selected) {
      skippedCount++;
    } else if (selected === q.correct_answer) {
      isCorrect = true;
      correctCount++;
      marksAwarded = q.marks;
      score += q.marks;
    } else {
      isCorrect = false;
      incorrectCount++;
      marksAwarded = -q.negative_marks;
      score -= q.negative_marks;
    }
    
    if (selected) {
      updatesToAnswers.push({
        attempt_id: attemptId,
        question_id: q.id,
        is_correct: isCorrect,
        marks_awarded: marksAwarded
      });
    }
  }
  
  for (const update of updatesToAnswers) {
    await supabase.from('attempt_answers').update({
      is_correct: update.is_correct,
      marks_awarded: update.marks_awarded
    }).eq('attempt_id', update.attempt_id).eq('question_id', update.question_id);
  }
  
  const totalMarks = attempt.exams?.total_marks || 0;
  let percentage = 0;
  if (totalMarks > 0) {
    percentage = (score / totalMarks) * 100;
  }
  
  const totalQ = attempt.exams?.total_questions || (questions?.length ?? 0);
  
  const now = new Date();
  const isAuto = now > new Date(attempt.expires_at);
  const status = isAuto ? 'auto_submitted' : 'submitted';

  const { data, error } = await supabase.from('exam_attempts').update({
    status,
    submitted_at: now.toISOString(),
    answered_count: correctCount + incorrectCount,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    skipped_count: totalQ - (correctCount + incorrectCount),
    score,
    percentage
  }).eq('id', attemptId).select().single();
  
  if (error) throw error;
  return data;
}
