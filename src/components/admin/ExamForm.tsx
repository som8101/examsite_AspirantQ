'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { createExamAction, updateExamAction } from '@/app/admin/exams/actions';
import { Copy, RefreshCw } from 'lucide-react';

export function ExamForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState(initialData?.schedule_type || 'immediate');
  const [requireAccessCode, setRequireAccessCode] = useState(!!initialData?.access_code);
  const [accessCode, setAccessCode] = useState(initialData?.access_code || '');
  const formRef = useRef<HTMLFormElement>(null);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setAccessCode(result);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (initialData?.id) {
        // @ts-ignore
        result = await updateExamAction(initialData.id, formData);
    } else {
        result = await createExamAction(null, formData);
    }

    if (result?.error) {
      setError(result.message);
      setLoading(false);
    } else if (result?.redirectUrl) {
      router.replace(result.redirectUrl);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Exam Name</Label>
              <Input id="title" name="title" required placeholder="e.g. Computer Networks Mock Test" defaultValue={initialData?.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Mock Test" defaultValue={initialData?.category} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g. Computer Networks" defaultValue={initialData?.subject} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_questions">Total Questions</Label>
              <Input id="total_questions" name="total_questions" type="number" min="1" required defaultValue={initialData?.total_questions || "50"} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" min="1" required defaultValue={initialData?.duration_minutes || "60"} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks_per_question">Marks Per Question</Label>
              <Input id="marks_per_question" name="marks_per_question" type="number" step="0.01" min="0.1" required defaultValue={initialData?.marks_per_question || "1"} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative_marks">Negative Marking (Penalty)</Label>
              <Input id="negative_marks" name="negative_marks" type="number" step="0.01" min="0" required defaultValue={initialData?.negative_marks ?? "0.25"} />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="schedule_type">Exam Availability</Label>
              <select 
                id="schedule_type" 
                name="schedule_type" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
              >
                <option value="immediate">Start Immediately (On Publish)</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>

            {scheduleType === 'scheduled' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="scheduled_start_at">Start Date & Time</Label>
                <Input 
                  id="scheduled_start_at" 
                  name="scheduled_start_at" 
                  type="datetime-local" 
                  required={scheduleType === 'scheduled'}
                  defaultValue={initialData?.scheduled_start_at ? (() => {
                    const d = new Date(initialData.scheduled_start_at);
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  })() : ""}
                />
                <p className="text-xs text-muted-foreground">The exam will automatically open at this time.</p>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="scheduled_end_at">End Date & Time (Optional)</Label>
              <Input 
                id="scheduled_end_at" 
                name="scheduled_end_at" 
                type="datetime-local" 
                defaultValue={initialData?.scheduled_end_at ? (() => {
                  const d = new Date(initialData.scheduled_end_at);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                })() : ""}
              />
              <p className="text-xs text-muted-foreground">If set, the exam will automatically close at this time and no new attempts can be started. Students already in the exam will be forced to submit.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea 
                id="instructions" 
                name="instructions" 
                placeholder="Enter instructions for students..." 
                rows={4}
                defaultValue={initialData?.instructions ?? "1. Each question has one correct answer.\n2. The exam automatically submits when time expires.\n3. You can mark questions for review."}
              />
            </div>

            <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require_access_code" className="text-base">Require Access Code</Label>
                  <p className="text-xs text-muted-foreground">Students must enter a secret code to start this exam.</p>
                </div>
                <Switch 
                  id="require_access_code" 
                  checked={requireAccessCode}
                  onCheckedChange={(checked) => {
                    setRequireAccessCode(checked);
                    if (checked && !accessCode) generateCode();
                    if (!checked) setAccessCode('');
                  }}
                />
              </div>

              {requireAccessCode && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-sm font-medium">Access Code</p>
                     <p className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{accessCode}</p>
                   </div>
                   <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={generateCode} title="Regenerate">
                         <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(accessCode);
                        alert("Access code copied to clipboard!");
                      }}>
                         <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                   </div>
                   <input type="hidden" name="access_code" value={accessCode} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create & Proceed to Import')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
