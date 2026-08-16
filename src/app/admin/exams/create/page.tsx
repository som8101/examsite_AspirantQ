'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle2, ChevronRight, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ExamCreateWizard() {
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateProcessing = () => {
    setStep('processing');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep('review'), 500);
      }
    }, 150);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12 space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin Console</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Create AI Exam</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">New Exam Assessment</h1>
        </div>
        
        {/* Stepper */}
        <div className="hidden md:flex items-center gap-4 glass-panel px-6 py-3 rounded-full">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'upload' ? 'border-primary bg-primary/10' : 'border-border'}`}>1</div>
            Upload
          </div>
          <div className="w-8 h-[2px] bg-border"></div>
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'processing' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'processing' ? 'border-primary bg-primary/10' : 'border-border'}`}>2</div>
            AI Processing
          </div>
          <div className="w-8 h-[2px] bg-border"></div>
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'review' ? 'border-primary bg-primary/10' : 'border-border'}`}>3</div>
            Review & Publish
          </div>
        </div>
      </div>

      {step === 'upload' && (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-4xl mx-auto mt-12 flex flex-col items-center border-dashed border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer" onClick={simulateProcessing}>
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
            <UploadCloud className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Question Paper</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Drag and drop your PDF or image files here, or click to browse. Our AI will automatically extract questions, options, and answers.
          </p>
          <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            Select Files
          </Button>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> PDF</span>
            <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> JPEG/PNG</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Up to 50MB</span>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="glass-panel rounded-3xl p-16 text-center max-w-3xl mx-auto mt-12 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary transition-all duration-300" strokeDasharray="301" strokeDashoffset={301 - (301 * uploadProgress) / 100} />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-card rounded-full border-2 border-primary/20 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">AI is analyzing your document</h2>
          <p className="text-muted-foreground mb-8">Extracting questions, identifying correct answers, and formatting options...</p>
          <div className="w-full max-w-md bg-muted rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-sm font-medium text-primary">{uploadProgress}% Complete</p>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          {/* Left Pane: PDF Preview */}
          <div className="glass-panel rounded-3xl overflow-hidden flex-1 flex flex-col relative border-primary/20">
            <div className="bg-card/40 border-b border-border/50 p-4 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">midterm_physics.pdf</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Page 1 of 4</Badge>
            </div>
            <div className="flex-1 bg-muted/30 p-8 overflow-y-auto flex justify-center">
              {/* Simulated PDF document */}
              <div className="bg-white w-full max-w-[600px] h-fit p-10 shadow-md border border-slate-200 text-slate-800 font-serif">
                <h1 className="text-2xl font-bold text-center mb-6 border-b pb-4">Physics Midterm Examination</h1>
                <p className="mb-4 text-sm opacity-70">Answer all questions. Time allowed: 2 hours.</p>
                
                <div className="mb-6 relative">
                  <div className="absolute -left-4 -top-2 w-full h-full bg-primary/10 border-2 border-primary/50 rounded pointer-events-none opacity-50 z-10"></div>
                  <p className="font-semibold mb-2">1. What is the SI unit of Force?</p>
                  <ol className="list-[lower-alpha] pl-6 space-y-1">
                    <li>Joule</li>
                    <li>Newton</li>
                    <li>Watt</li>
                    <li>Pascal</li>
                  </ol>
                  <p className="mt-2 text-sm italic text-red-600">Ans: b</p>
                </div>
                
                <div className="mb-6">
                  <p className="font-semibold mb-2">2. Which of the following is a scalar quantity?</p>
                  <ol className="list-[lower-alpha] pl-6 space-y-1">
                    <li>Velocity</li>
                    <li>Acceleration</li>
                    <li>Mass</li>
                    <li>Force</li>
                  </ol>
                  <p className="mt-2 text-sm italic text-red-600">Ans: c</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Extracted Editor */}
          <div className="glass-panel rounded-3xl overflow-hidden w-full lg:w-[500px] xl:w-[600px] flex flex-col border-primary/20 bg-card">
            <div className="bg-card/40 border-b border-border/50 p-4 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="font-medium">2 Questions Extracted</span>
              </div>
              <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Publish Exam
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Question 1 Editor */}
              <div className="border border-border rounded-2xl p-5 bg-background shadow-sm hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">Question 1</span>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">+1.0</span>
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">-0.25</span>
                  </div>
                </div>
                
                <textarea className="w-full text-sm font-medium bg-transparent border-none resize-none focus:ring-0 p-0 mb-4 h-10" defaultValue="What is the SI unit of Force?" />
                
                <div className="space-y-2">
                  {[
                    { id: 'A', text: 'Joule', isCorrect: false },
                    { id: 'B', text: 'Newton', isCorrect: true },
                    { id: 'C', text: 'Watt', isCorrect: false },
                    { id: 'D', text: 'Pascal', isCorrect: false },
                  ].map((opt) => (
                    <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'border-transparent hover:bg-muted/50'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer ${opt.isCorrect ? 'bg-green-500 border-green-600 text-white' : 'border-border text-muted-foreground hover:border-primary'}`}>
                        {opt.isCorrect && <CheckCircle2 className="h-3 w-3" />}
                        {!opt.isCorrect && opt.id}
                      </div>
                      <input type="text" className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0" defaultValue={opt.text} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Question 2 Editor */}
              <div className="border border-border rounded-2xl p-5 bg-background shadow-sm hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">Question 2</span>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">+1.0</span>
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">-0.25</span>
                  </div>
                </div>
                
                <textarea className="w-full text-sm font-medium bg-transparent border-none resize-none focus:ring-0 p-0 mb-4 h-10" defaultValue="Which of the following is a scalar quantity?" />
                
                <div className="space-y-2">
                  {[
                    { id: 'A', text: 'Velocity', isCorrect: false },
                    { id: 'B', text: 'Acceleration', isCorrect: false },
                    { id: 'C', text: 'Mass', isCorrect: true },
                    { id: 'D', text: 'Force', isCorrect: false },
                  ].map((opt) => (
                    <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'border-transparent hover:bg-muted/50'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer ${opt.isCorrect ? 'bg-green-500 border-green-600 text-white' : 'border-border text-muted-foreground hover:border-primary'}`}>
                        {opt.isCorrect && <CheckCircle2 className="h-3 w-3" />}
                        {!opt.isCorrect && opt.id}
                      </div>
                      <input type="text" className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0" defaultValue={opt.text} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
