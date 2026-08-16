import { NextRequest, NextResponse } from 'next/server';
import { triggerAnswerExtraction } from '@/services/extraction';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { examId, answerKeyId } = await req.json();
    if (!examId || !answerKeyId) {
      return NextResponse.json({ message: "Missing examId or answerKeyId" }, { status: 400 });
    }
    
    await triggerAnswerExtraction(examId, answerKeyId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ message: error.message || "Failed to extract answers" }, { status: 500 });
  }
}
