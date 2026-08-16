import { z } from 'zod';

export const QuestionExtractionSchema = z.object({
  questions: z.array(
    z.object({
      question_number: z.number(),
      question: z.string(),
      options: z.object({
        A: z.string().optional(),
        B: z.string().optional(),
        C: z.string().optional(),
        D: z.string().optional(),
      }).optional(),
      explanation: z.string().nullable().optional(),
      marks: z.number().nullable().optional(),
      negative_marks: z.number().nullable().optional(),
      subject: z.string().nullable().optional(),
      topic: z.string().nullable().optional(),
      source_page: z.number().nullable().optional(),
      confidence: z.number().nullable().optional(),
    })
  )
});

export type QuestionExtractionResult = z.infer<typeof QuestionExtractionSchema>;

export const AnswerKeyExtractionSchema = z.object({
  answers: z.array(
    z.object({
      question_number: z.number(),
      answer: z.enum(['A', 'B', 'C', 'D']),
      confidence: z.number().nullable().optional(),
    })
  )
});

export type AnswerKeyExtractionResult = z.infer<typeof AnswerKeyExtractionSchema>;

export interface DocumentInfo {
  mimeType: string;
  data: string; // Base64 encoded string
}

export interface AIProvider {
  extractQuestions(documents: DocumentInfo[], systemPrompt: string): Promise<QuestionExtractionResult>;
  extractAnswerKey(documents: DocumentInfo[], systemPrompt: string): Promise<AnswerKeyExtractionResult>;
}
