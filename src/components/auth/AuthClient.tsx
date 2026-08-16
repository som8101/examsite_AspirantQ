'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { login, signup, resetPassword } from '@/app/login/actions';

export function AuthClient({ error, message }: { error?: string, message?: string }) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [password, setPassword] = useState('');

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative z-0 overflow-hidden">
       {/* Background Decorators */}
       <div className="absolute top-0 left-0 w-full h-full -z-10 bg-mesh-animated opacity-100"></div>
       <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
       <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

       <div className="max-w-md w-full p-8 glass-panel rounded-3xl relative z-10 border border-border shadow-2xl backdrop-blur-2xl">
           <div className="flex justify-center mb-8">
             <div className="flex items-center gap-2">
               <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/20">
                 <BookOpen className="h-6 w-6 text-white" />
               </div>
               <span className="text-2xl font-black tracking-tight drop-shadow-sm">Aspirants Q</span>
             </div>
           </div>

           {error && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
           )}

           {message && (
            <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {message}
            </div>
           )}

            <Tabs value={role} onValueChange={(v) => setRole(v as 'student'|'admin')} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg h-12 border border-border">
                 <TabsTrigger value="student" className="rounded-md font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm transition-all">Student Portal</TabsTrigger>
                 <TabsTrigger value="admin" className="rounded-md font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm transition-all">Admin Portal</TabsTrigger>
              </TabsList>
           </Tabs>

           {view === 'login' && (
             <form action={login} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="space-y-2">
                  <Label htmlFor="loginId" className="text-foreground/90">User ID</Label>
                  <Input id="loginId" name="loginId" type="text" required placeholder={`Enter your ${role === 'admin' ? 'Admin' : 'Student'} ID`} className="h-11 rounded-lg bg-background/50 border-border" />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="password" className="text-foreground/90">Password</Label>
                     <button type="button" onClick={() => setView('forgot')} className="text-sm font-medium text-primary hover:text-primary/80">Forgot?</button>
                  </div>
                  <Input id="password" name="password" type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg bg-background/50 border-border" />
               </div>
               <SubmitButton loadingText="Logging in..." className="w-full h-11 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-primary text-white shadow-lg shadow-primary/20 rounded-xl transition-all duration-300">
                  Log In as {role === 'admin' ? 'Admin' : 'Student'}
               </SubmitButton>
               <p className="text-center text-sm text-foreground/70 mt-4">
                 Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-primary font-medium hover:underline">Sign up</button>
               </p>
             </form>
           )}

           {view === 'signup' && (
             <form action={signup} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <input type="hidden" name="role" value={role} />
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground/90">Full Name</Label>
                    <Input id="fullName" name="fullName" required placeholder="John Doe" className="h-11 rounded-lg bg-background/50 border-border" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="signupLoginId" className="text-foreground/90">Choose User ID</Label>
                    <Input id="signupLoginId" name="loginId" required placeholder={role === 'admin' ? 'ADM-01' : 'STU-123'} className="h-11 rounded-lg bg-background/50 border-border" />
                 </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="signupEmail" className="text-foreground/90">Email</Label>
                  <Input id="signupEmail" name="email" type="email" required placeholder="you@example.com" className="h-11 rounded-lg bg-background/50 border-border" />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-foreground/90">Create Password</Label>
                  <Input 
                    id="signupPassword" 
                    name="password" 
                    type="password" 
                    required 
                    className="h-11 rounded-lg bg-background/50 border-border" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  <div className="pt-2 pb-1 space-y-2">
                     <div className="text-xs font-medium text-foreground/70 mb-1">Password Requirements:</div>
                     <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
                       <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} 8+ Characters
                       </div>
                       <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} Uppercase Letter
                       </div>
                       <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} Number
                       </div>
                       <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                         {hasSpecial ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} Special Symbol
                       </div>
                     </div>
                  </div>
               </div>

               <SubmitButton loadingText="Creating Account..." disabled={!isPasswordValid} className="w-full h-11 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-primary text-white shadow-lg shadow-primary/20 rounded-xl transition-all duration-300 mt-2">
                  Create {role === 'admin' ? 'Admin' : 'Student'} Account
               </SubmitButton>
               <p className="text-center text-sm text-foreground/70 mt-4">
                 Already have an account? <button type="button" onClick={() => setView('login')} className="text-primary font-medium hover:underline">Log in</button>
               </p>
             </form>
           )}

           {view === 'forgot' && (
             <form action={resetPassword} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="text-center mb-6">
                 <h3 className="text-lg font-bold">Reset Password</h3>
                 <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link.</p>
               </div>
               
               <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input id="resetEmail" name="email" type="email" required placeholder="you@example.com" className="h-11 rounded-lg" />
               </div>

               <SubmitButton loadingText="Sending Link..." className="w-full h-11 text-base bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg transition-all mt-4">
                 Send Reset Link
               </SubmitButton>
               <p className="text-center text-sm text-slate-500 mt-4">
                 Remembered it? <button type="button" onClick={() => setView('login')} className="text-indigo-600 font-medium hover:underline">Back to login</button>
               </p>
             </form>
           )}
       </div>
    </div>
  );
}
