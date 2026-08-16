import { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signout } from '@/app/login/actions';
import { MobileNav } from '@/components/admin/MobileNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-transparent text-foreground">
      {/* Sidebar */}
      <aside className="w-64 glass-sidebar flex flex-col z-10 hidden md:flex">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Aspirants Q
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Admin Console</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <BookOpen className="h-4 w-4" /> Exams
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <Users className="h-4 w-4" /> Students
          </Link>
          <Link href="/admin/schedule" className="flex items-center gap-3 px-3 py-2.5 rounded-full hover:bg-card/50 text-sm font-medium transition-colors">
            <Calendar className="h-4 w-4" /> Schedule
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <form action={signout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-0 md:pl-0">
        {/* We can hide this header or replace it since the Dashboard page has its own title */}
        <header className="glass-panel rounded-none border-t-0 border-x-0 h-16 flex md:hidden items-center px-4 justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <MobileNav signoutAction={signout} />
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
               <BookOpen className="h-5 w-5" /> Aspirants Q
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
