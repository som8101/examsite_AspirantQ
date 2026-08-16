'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ImportClient({ examId }: { examId: string }) {
  const router = useRouter();
  const [qpStatus, setQpStatus] = useState<'idle' | 'uploading' | 'extracting' | 'success' | 'error'>('idle');
  const [akStatus, setAkStatus] = useState<'idle' | 'uploading' | 'extracting' | 'success' | 'error'>('idle');
  const [qpError, setQpError] = useState('');
  const [akError, setAkError] = useState('');

  const supabase = createClient();

  const handleQpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setQpStatus('uploading');
      setQpError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${examId}-qp-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('question-papers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: qpRecord, error: dbError } = await supabase.from('question_papers').insert({
        exam_id: examId,
        file_name: file.name,
        file_url: fileName,
        file_type: file.type,
        file_size: file.size,
        processing_status: 'uploaded'
      }).select().single();

      if (dbError) throw dbError;

      setQpStatus('extracting');
      const res = await fetch(`/api/extraction/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, paperId: qpRecord.id })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Extraction failed');
      }

      setQpStatus('success');
      router.refresh();
      
    } catch (err: any) {
      setQpStatus('error');
      setQpError(err.message || 'An error occurred');
    }
  };

  const handleAkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAkStatus('uploading');
      setAkError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${examId}-ak-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('answer-keys')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: akRecord, error: dbError } = await supabase.from('answer_keys').insert({
        exam_id: examId,
        file_name: file.name,
        file_url: fileName,
        file_type: file.type,
        file_size: file.size,
        processing_status: 'uploaded'
      }).select().single();

      if (dbError) throw dbError;

      setAkStatus('extracting');
      const res = await fetch(`/api/extraction/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, answerKeyId: akRecord.id })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Extraction failed');
      }

      setAkStatus('success');
      router.refresh();
      
    } catch (err: any) {
      setAkStatus('error');
      setAkError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Paper</CardTitle>
          <CardDescription>Upload the main question paper document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleQpUpload}
              disabled={qpStatus === 'uploading' || qpStatus === 'extracting' || qpStatus === 'success'}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-4 bg-indigo-50 rounded-full">
                <UploadCloud className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="text-sm font-medium">Click to upload or drag and drop</div>
              <div className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG or PNG</div>
            </div>
          </div>
          
          {qpStatus === 'uploading' && <div className="text-sm text-blue-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading file...</div>}
          {qpStatus === 'extracting' && <div className="text-sm text-amber-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> AI is extracting questions... This may take a minute.</div>}
          {qpStatus === 'success' && <div className="text-sm text-green-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Questions extracted successfully!</div>}
          {qpStatus === 'error' && <div className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {qpError}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answer Key</CardTitle>
          <CardDescription>Upload the separate answer key document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleAkUpload}
              disabled={akStatus === 'uploading' || akStatus === 'extracting' || akStatus === 'success'}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-4 bg-indigo-50 rounded-full">
                <UploadCloud className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="text-sm font-medium">Click to upload or drag and drop</div>
              <div className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG or PNG</div>
            </div>
          </div>

          {akStatus === 'uploading' && <div className="text-sm text-blue-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading file...</div>}
          {akStatus === 'extracting' && <div className="text-sm text-amber-600 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> AI is extracting answers...</div>}
          {akStatus === 'success' && <div className="text-sm text-green-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Answers extracted and matched successfully!</div>}
          {akStatus === 'error' && <div className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {akError}</div>}
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 flex justify-end mt-4">
         <Button onClick={() => router.replace(`/admin/exams/${examId}/review`)}>
           Proceed to Review <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </div>
    </div>
  );
}
