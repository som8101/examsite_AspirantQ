import { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogOut, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signout } from '@/app/login/actions';
import { MobileNav } from '@/components/student/MobileNav';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'student';
  if (!user || role !== 'student') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-transparent text-foreground">
      <aside className="w-64 glass-sidebar flex flex-col hidden md:flex z-10">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Aspirants Q
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Student Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <Award className="h-4 w-4" /> My Results
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
           <div className="mb-4 px-3 flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {user.email?.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden text-sm">
                <p className="font-medium truncate">{user.user_metadata?.full_name || 'Student'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
             </div>
           </div>
          <form action={signout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative z-0">
        <div className="md:hidden glass-panel rounded-none border-t-0 border-x-0 h-16 flex items-center px-4 justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <MobileNav signoutAction={signout} />
            <h1 className="text-lg font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Aspirants Q
            </h1>
          </div>
          <form action={signout}>
            <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
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
