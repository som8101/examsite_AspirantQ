import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, DocumentInfo, QuestionExtractionResult, AnswerKeyExtractionResult, QuestionExtractionSchema, AnswerKeyExtractionSchema } from './types';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  
  constructor(apiKey?: string) {
    const key = apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("AI API Key is missing. Please set AI_API_KEY in your environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async extractQuestions(documents: DocumentInfo[], systemPrompt: string): Promise<QuestionExtractionResult> {
    const parts = documents.map(doc => ({
      inlineData: {
        data: doc.data,
        mimeType: doc.mimeType,
      }
    }));
    
    const allParts: any[] = [...parts, systemPrompt];

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: allParts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_number: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.OBJECT,
                    properties: {
                      A: { type: Type.STRING },
                      B: { type: Type.STRING },
                      C: { type: Type.STRING },
                      D: { type: Type.STRING },
                    }
                  },
                  explanation: { type: Type.STRING, nullable: true },
                  marks: { type: Type.NUMBER, nullable: true },
                  negative_marks: { type: Type.NUMBER, nullable: true },
                  subject: { type: Type.STRING, nullable: true },
                  topic: { type: Type.STRING, nullable: true },
                  source_page: { type: Type.INTEGER, nullable: true },
                  confidence: { type: Type.NUMBER, nullable: true },
                },
                required: ["question_number", "question"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    return QuestionExtractionSchema.parse(JSON.parse(text));
  }

  async extractAnswerKey(documents: DocumentInfo[], systemPrompt: string): Promise<AnswerKeyExtractionResult> {
    const parts = documents.map(doc => ({
      inlineData: {
        data: doc.data,
        mimeType: doc.mimeType,
      }
    }));
    
    const allParts: any[] = [...parts, systemPrompt];

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: allParts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_number: { type: Type.INTEGER },
                  answer: { type: Type.STRING },
                  confidence: { type: Type.NUMBER, nullable: true },
                },
                required: ["question_number", "answer"]
              }
            }
          },
          required: ["answers"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(text);
    if (parsed.answers && Array.isArray(parsed.answers)) {
       parsed.answers = parsed.answers.map((a: any) => ({
         ...a,
         answer: typeof a.answer === 'string' ? a.answer.toUpperCase().trim() : a.answer
       }));
    }

    return AnswerKeyExtractionSchema.parse(parsed);
  }
}
