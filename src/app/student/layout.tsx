import { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogOut, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signout } from '@/app/login/actions';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'student';
  if (!user || role !== 'student') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            ExamPlatform
          </h1>
          <p className="text-xs text-slate-500 mt-1">Student Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-sm font-medium">
            <Award className="h-4 w-4" /> My Results
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
           <div className="mb-4 px-3 flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
               {user.email?.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden text-sm">
                <p className="font-medium truncate">{user.user_metadata?.full_name || 'Student'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
           </div>
          <form action={signout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4 justify-between">
           <h1 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            ExamPlatform
          </h1>
          <form action={signout}>
            <Button type="submit" variant="ghost" size="icon" className="text-red-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
