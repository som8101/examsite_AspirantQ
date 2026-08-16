'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-xl">
           <div className="flex justify-center mb-8">
             <div className="flex items-center gap-2">
               <div className="bg-indigo-600 p-2 rounded-xl shadow-sm">
                 <BookOpen className="h-6 w-6 text-white" />
               </div>
               <span className="text-2xl font-black text-slate-900 tracking-tight">ExamPlatform</span>
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
              <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-lg h-12">
                 <TabsTrigger value="student" className="rounded-md font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Student Portal</TabsTrigger>
                 <TabsTrigger value="admin" className="rounded-md font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Admin Portal</TabsTrigger>
              </TabsList>
           </Tabs>

           {view === 'login' && (
             <form action={login} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="space-y-2">
                  <Label htmlFor="loginId">User ID</Label>
                  <Input id="loginId" name="loginId" type="text" required placeholder={`Enter your ${role === 'admin' ? 'Admin' : 'Student'} ID`} className="h-11 rounded-lg" />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="password">Password</Label>
                     <button type="button" onClick={() => setView('forgot')} className="text-xs text-indigo-600 font-medium hover:underline">Forgot password?</button>
                  </div>
                  <Input id="password" name="password" type="password" required className="h-11 rounded-lg" />
               </div>
               <Button type="submit" className="w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md shadow-indigo-200">
                  Log In as {role === 'admin' ? 'Admin' : 'Student'}
               </Button>
               <p className="text-center text-sm text-slate-500 mt-4">
                 Don't have an account? <button type="button" onClick={() => setView('signup')} className="text-indigo-600 font-medium hover:underline">Sign up</button>
               </p>
             </form>
           )}

           {view === 'signup' && (
             <form action={signup} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <input type="hidden" name="role" value={role} />
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" required placeholder="John Doe" className="h-11 rounded-lg" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="signupLoginId">Choose User ID</Label>
                    <Input id="signupLoginId" name="loginId" required placeholder={role === 'admin' ? 'ADM-01' : 'STU-123'} className="h-11 rounded-lg" />
                 </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input id="signupEmail" name="email" type="email" required placeholder="you@example.com" className="h-11 rounded-lg" />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="signupPassword">Create Password</Label>
                  <Input 
                    id="signupPassword" 
                    name="password" 
                    type="password" 
                    required 
                    className="h-11 rounded-lg" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  <div className="pt-2 pb-1 space-y-2">
                     <div className="text-xs font-medium text-slate-500 mb-1">Password Requirements:</div>
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

               <Button type="submit" disabled={!isPasswordValid} className="w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md shadow-indigo-200 mt-2">
                  Create {role === 'admin' ? 'Admin' : 'Student'} Account
               </Button>
               <p className="text-center text-sm text-slate-500 mt-4">
                 Already have an account? <button type="button" onClick={() => setView('login')} className="text-indigo-600 font-medium hover:underline">Log in</button>
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

               <Button type="submit" className="w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md shadow-indigo-200">
                  Send Reset Link
               </Button>
               <p className="text-center text-sm text-slate-500 mt-4">
                 Remembered it? <button type="button" onClick={() => setView('login')} className="text-indigo-600 font-medium hover:underline">Back to login</button>
               </p>
             </form>
           )}
       </div>
    </div>
  );
}
