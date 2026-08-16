'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Plus, KeyRound, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { updateExamSettingsAction, generateAccessCodesAction } from '@/app/admin/exams/actions';
import { useRouter } from 'next/navigation';

export function SettingsClient({ exam, initialCodes }: { exam: any, initialCodes: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    strict_timer: exam.strict_timer ?? true,
    shuffle_questions: exam.shuffle_questions ?? false,
    immediate_results: exam.immediate_results ?? false,
    proctoring_mode: exam.proctoring_mode ?? false
  });

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    startTransition(async () => {
      await updateExamSettingsAction(exam.id, newSettings);
    });
  };

  const handleGenerateCodes = async () => {
    setIsGenerating(true);
    await generateAccessCodesAction(exam.id, 5);
    setIsGenerating(false);
  };

  return (
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
              <Switch checked={settings.strict_timer} onCheckedChange={() => handleToggle('strict_timer')} disabled={isPending} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Shuffle Questions</h3>
                <p className="text-sm text-muted-foreground">Randomize order per student.</p>
              </div>
              <Switch checked={settings.shuffle_questions} onCheckedChange={() => handleToggle('shuffle_questions')} disabled={isPending} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Immediate Results</h3>
                <p className="text-sm text-muted-foreground">Show score after submission.</p>
              </div>
              <Switch checked={settings.immediate_results} onCheckedChange={() => handleToggle('immediate_results')} disabled={isPending} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Proctoring Mode</h3>
                <p className="text-sm text-muted-foreground">Track tab switching & focus.</p>
              </div>
              <Switch checked={settings.proctoring_mode} onCheckedChange={() => handleToggle('proctoring_mode')} disabled={isPending} />
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
            <Button onClick={handleGenerateCodes} disabled={isGenerating} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Generate Codes
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
                  <th className="p-4 font-medium">Redeemed By</th>
                  <th className="p-4 font-medium">Generated</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {initialCodes.map((c, idx) => (
                  <tr key={c.id} className={`border-b border-border/50 hover:bg-card/50 transition-colors ${idx === initialCodes.length - 1 ? 'border-none' : ''}`}>
                    <td className="p-4 font-mono font-medium text-foreground">
                      {c.code}
                    </td>
                    <td className="p-4">
                      {c.status === 'unused' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D9E9CF] text-[#4a5f42]">
                          Unused
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Redeemed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {c.profiles?.email ? (
                        <span className="flex items-center gap-2">
                           <CheckCircle2 className="h-3 w-3 text-[#B6CEB4]" />
                           {c.profiles.email}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => navigator.clipboard.writeText(c.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {initialCodes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <KeyRound className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No access codes generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
