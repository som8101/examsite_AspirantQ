'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, LayoutDashboard, Users, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav({ signoutAction }: { signoutAction: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/exams', icon: BookOpen, label: 'Exams' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/schedule', icon: Calendar, label: 'Schedule' },
  ];

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Aspirants Q
            </h2>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col flex-1 p-6 space-y-4">
            <nav className="flex flex-col space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-card/50 text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-border/50">
              <form action={signoutAction}>
                <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-4 py-3 text-lg h-auto">
                  <LogOut className="h-5 w-5 mr-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
