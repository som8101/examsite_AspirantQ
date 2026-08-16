'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Search, Filter, Download, UserCircle, CheckCircle2, XCircle } from 'lucide-react';

export function ResultsTableClient({ attempts, exam }: { attempts: any[], exam: any }) {
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const completedAttempts = attempts?.filter(a => ['submitted', 'auto_submitted'].includes(a.status)) || [];
  const inProgressAttempts = attempts?.filter(a => a.status === 'in_progress') || [];

  return (
    <div className="relative">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search students..." className="w-full bg-card border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-card">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Button variant="outline" className="rounded-full bg-card text-primary border-primary/20 hover:bg-primary/10">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {attempts && attempts.length > 0 ? (
          <div className="overflow-x-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-card/20 text-sm text-muted-foreground">
                  <th className="p-5 font-medium">Student Name</th>
                  <th className="p-5 font-medium">Status</th>
                  <th className="p-5 font-medium">Score</th>
                  <th className="p-5 font-medium">Time Taken</th>
                  <th className="p-5 font-medium">Submitted</th>
                  <th className="p-5 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {attempts.map((attempt, idx) => (
                  <tr key={attempt.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors cursor-pointer ${selectedAttempt?.id === attempt.id ? 'bg-primary/5' : ''} ${idx === attempts.length - 1 ? 'border-none' : ''}`} onClick={() => setSelectedAttempt(attempt)}>
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{attempt.profiles?.full_name || 'Unknown Student'}</div>
                        <div className="text-xs text-muted-foreground">{attempt.profiles?.login_id || attempt.profiles?.email}</div>
                      </div>
                    </td>
                    <td className="p-5">
                      {['submitted', 'auto_submitted'].includes(attempt.status) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D9E9CF] text-[#4a5f42] border border-[#B6CEB4]">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="p-5 font-medium text-foreground">
                      {['submitted', 'auto_submitted'].includes(attempt.status) ? (
                        `${attempt.score} / ${exam.total_marks || exam.total_questions}`
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {/* Placeholder for actual time calculation */}
                      45m 12s
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-5 text-right">
                      <Button variant="ghost" size="sm" className="rounded-full text-primary hover:text-primary hover:bg-primary/10">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h3 className="font-medium text-foreground mb-1">No attempts yet</h3>
            <p className="text-sm text-muted-foreground">When students take this exam, their results will appear here.</p>
          </div>
        )}
      </div>

      {/* Slide-out Panel Overlay */}
      {selectedAttempt && (
        <>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedAttempt(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white/90 backdrop-blur-3xl shadow-2xl z-50 border-l border-border transform transition-transform duration-300 flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedAttempt.profiles?.full_name || 'Student'}</h2>
                <p className="text-sm text-muted-foreground">Attempt Details</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => setSelectedAttempt(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
              {/* Score summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">Final Score</span>
                  <span className="text-3xl font-bold text-primary">{selectedAttempt.score}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground mb-1">Accuracy</span>
                  <span className="text-3xl font-bold text-foreground">
                    {Math.round((selectedAttempt.score / (exam.total_marks || exam.total_questions)) * 100) || 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border/50 pb-2">Question Breakdown</h3>
                
                {/* Mock breakdown items */}
                {[
                  { q: 1, correct: true, text: "What is the SI unit of Force?" },
                  { q: 2, correct: false, text: "Which of the following is a scalar quantity?" },
                  { q: 3, correct: true, text: "Calculate the acceleration..." },
                  { q: 4, correct: true, text: "What happens to kinetic energy if..." },
                ].map((item, i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl flex gap-4 items-start">
                    <div className="mt-1">
                      {item.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-[#B6CEB4]" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Q{item.q}. {item.text}</div>
                      <div className={`text-xs px-2 py-1 rounded inline-block ${item.correct ? 'bg-[#D9E9CF]/50 text-[#4a5f42]' : 'bg-red-50 text-red-600'}`}>
                        {item.correct ? '+1.0 marks' : '-0.25 marks'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
