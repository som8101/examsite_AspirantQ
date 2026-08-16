import { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signout } from '@/app/login/actions';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            ExamPlatform
          </h1>
          <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">
            <BookOpen className="h-4 w-4" /> Exams
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">
            <Users className="h-4 w-4" /> Students
          </Link>
          <Link href="/admin/schedule" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium">
            <Calendar className="h-4 w-4" /> Schedule
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <form action={signout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-medium">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
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
