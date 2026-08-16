'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Plus, KeyRound, CheckCircle2, Copy } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function ExamSettingsPage() {
  const [codes, setCodes] = useState([
    { id: '1', code: 'EXM-A9B2-K89X', status: 'unused', generatedAt: '2024-03-10' },
    { id: '2', code: 'EXM-P4V1-L77Q', status: 'redeemed', generatedAt: '2024-03-10', user: 'alex.rivera@example.com' },
    { id: '3', code: 'EXM-M9N3-W12Y', status: 'unused', generatedAt: '2024-03-12' },
  ]);

  const handleGenerateCodes = () => {
    const newCode = {
      id: Date.now().toString(),
      code: `EXM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'unused',
      generatedAt: new Date().toISOString().split('T')[0]
    };
    setCodes([newCode, ...codes]);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Exam Settings</h1>
          <p className="text-muted-foreground mt-1">Configure access rules and exam behavior for Physics Midterm.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Toggles */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">General Rules</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Strict Timer</h3>
                  <p className="text-sm text-muted-foreground">Auto-submit when time is up.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Shuffle Questions</h3>
                  <p className="text-sm text-muted-foreground">Randomize order per student.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Immediate Results</h3>
                  <p className="text-sm text-muted-foreground">Show score after submission.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Proctoring Mode</h3>
                  <p className="text-sm text-muted-foreground">Track tab switching & focus.</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Access Control */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Access Control</h2>
              </div>
              <Button onClick={handleGenerateCodes} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Plus className="h-4 w-4 mr-2" /> Generate Codes
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Generate unique access codes for this exam. Students must enter an unused code to begin their attempt.
            </p>

            <div className="overflow-x-auto bg-card/30 rounded-2xl border border-border/50 flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Access Code</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date Generated</th>
                    <th className="p-4 font-medium">Redeemed By</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-card/40 transition-colors">
                      <td className="p-4 font-mono font-medium text-foreground flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        {c.code}
                      </td>
                      <td className="p-4">
                        {c.status === 'unused' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Unused
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            Redeemed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{c.generatedAt}</td>
                      <td className="p-4 text-muted-foreground">{c.user || '-'}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {codes.length === 0 && (
                     <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No access codes generated yet.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
