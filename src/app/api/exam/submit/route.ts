import { NextRequest, NextResponse } from 'next/server';
import { submitAttemptAndScore } from '@/services/scoring';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ message: "Missing attemptId" }, { status: 400 });
    }
    
    const { data: attempt } = await supabase.from('exam_attempts').select('student_id').eq('id', attemptId).single();
    if (!attempt || attempt.student_id !== user.id) {
       return NextResponse.json({ message: "Unauthorized attempt" }, { status: 403 });
    }

    const result = await submitAttemptAndScore(attemptId);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ message: error.message || "Failed to submit" }, { status: 500 });
  }
}
