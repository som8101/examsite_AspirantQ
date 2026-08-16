import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai/provider';

async function getFileAsBase64(bucket: string, path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw new Error("Failed to download file");
  
  const arrayBuffer = await data.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { mimeType: data.type, data: base64 };
}

export async function triggerQuestionExtraction(examId: string, paperId: string) {
  const supabase = await createClient();
  await supabase.from('question_papers').update({ processing_status: 'processing' }).eq('id', paperId);
  
  try {
    const { data: paper } = await supabase.from('question_papers').select('*').eq('id', paperId).single();
    if (!paper) throw new Error("Paper not found");

    const doc = await getFileAsBase64('question-papers', paper.file_url);
    const ai = getAIProvider();
    
    const prompt = `Extract all questions from the provided examination paper. Ensure you capture the question number, the question text, and all available options (A, B, C, D). Do NOT attempt to answer the questions. Do not invent missing options. Output strictly conforming to the requested JSON schema.`;
    
    const result = await ai.extractQuestions([doc], prompt);
    
    // Fetch exam defaults
    const { data: exam } = await supabase.from('exams').select('marks_per_question, negative_marks, subject').eq('id', examId).single();

    for (const q of result.questions) {
      await supabase.from('questions').upsert({
        exam_id: examId,
        question_number: q.question_number,
        question: q.question,
        option_a: q.options?.A || null,
        option_b: q.options?.B || null,
        option_c: q.options?.C || null,
        option_d: q.options?.D || null,
        explanation: q.explanation || null,
        marks: q.marks ?? exam?.marks_per_question ?? 1,
        negative_marks: q.negative_marks ?? exam?.negative_marks ?? 0,
        subject: q.subject ?? exam?.subject ?? null,
        topic: q.topic || null,
        source_page: q.source_page || null,
        extraction_confidence: q.confidence || null,
        verification_status: 'pending'
      }, { onConflict: 'exam_id,question_number' });
    }
    
    await supabase.from('question_papers').update({ processing_status: 'completed' }).eq('id', paperId);
    
  } catch (error: any) {
    console.error("Extraction error:", error);
    await supabase.from('question_papers').update({ processing_status: 'failed' }).eq('id', paperId);
    throw error;
  }
}

export async function triggerAnswerExtraction(examId: string, answerKeyId: string) {
  const supabase = await createClient();
  await supabase.from('answer_keys').update({ processing_status: 'processing' }).eq('id', answerKeyId);
  
  try {
    const { data: answerKey } = await supabase.from('answer_keys').select('*').eq('id', answerKeyId).single();
    if (!answerKey) throw new Error("Answer Key not found");

    const doc = await getFileAsBase64('answer-keys', answerKey.file_url);
    const ai = getAIProvider();
    
    const prompt = `Extract all answers from the provided answer key. You must only extract the correct option mapped to the question number. Do not solve the questions yourself. Output strictly conforming to the JSON schema.`;
    
    const result = await ai.extractAnswerKey([doc], prompt);
    
    for (const a of result.answers) {
       const { data: existingQ } = await supabase.from('questions').select('id').eq('exam_id', examId).eq('question_number', a.question_number).single();
       if (existingQ) {
         await supabase.from('questions').update({ correct_answer: a.answer }).eq('id', existingQ.id);
       } else {
         await supabase.from('questions').upsert({
            exam_id: examId,
            question_number: a.question_number,
            question: "MISSING QUESTION DATA - FOUND IN ANSWER KEY ONLY",
            correct_answer: a.answer,
            verification_status: 'pending'
         }, { onConflict: 'exam_id,question_number' });
       }
    }
    
    await supabase.from('answer_keys').update({ processing_status: 'completed' }).eq('id', answerKeyId);
    
  } catch (error: any) {
    console.error("Answer Extraction error:", error);
    await supabase.from('answer_keys').update({ processing_status: 'failed' }).eq('id', answerKeyId);
    throw error;
  }
}
