import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, BrainCircuit, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dashboardLink = '/login';
  if (user) {
     dashboardLink = user.user_metadata?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative z-0 overflow-hidden">
      
      {/* Background Decorators - Removed intense pulses for visionOS clean look */}

      {/* Navigation */}
      <header className="glass-panel border-t-0 border-x-0 rounded-none sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Aspirants Q</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href={dashboardLink}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 shadow-md">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="rounded-full px-5 glass-panel hover:bg-white/10 font-medium">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 lg:py-32 px-4 text-center max-w-5xl mx-auto flex flex-col items-center relative">
          
          <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            <span className="text-foreground/80">Next-Gen Exam Platform</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight mb-8">
            The Future of <br/>
            <span className="text-primary">
              Online Examinations
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-foreground/60 mb-10 max-w-2xl leading-relaxed">
            Upload your question papers and answer keys. Our AI automatically extracts, maps, and generates a production-grade online exam in seconds. Strict, secure, and infinitely scalable.
          </p>
          
          <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
            <Link href={dashboardLink} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-transform duration-300 hover:scale-105">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">Everything you need to run exams</h2>
              <p className="text-foreground/60 max-w-2xl mx-auto">Built for educators and institutions who demand precision and reliability without the manual data entry overhead.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="glass-panel p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <BrainCircuit className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Automated Extraction</h3>
                <p className="text-foreground/60 leading-relaxed">Simply upload a PDF or image of your exam paper and answer key. The AI extracts questions, options, and maps the correct answers automatically.</p>
              </div>
              
              <div className="glass-panel p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                  <ShieldCheck className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Server-Authoritative</h3>
                <p className="text-foreground/60 leading-relaxed">Strict timing controlled by the server. Students cannot manipulate the clock, and exams auto-submit exactly when time runs out.</p>
              </div>
              
              <div className="glass-panel p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
                <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors border border-secondary/20">
                  <CheckCircle className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Advanced Scoring</h3>
                <p className="text-foreground/60 leading-relaxed">Support for positive and negative marking. Instantly evaluate thousands of attempts without manual grading.</p>
              </div>
              
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-x-0 border-b-0 rounded-none py-12 text-center mt-auto z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-foreground" />
          <span className="text-xl font-semibold tracking-tight">Aspirants Q</span>
        </div>
        <p className="text-foreground/50 text-sm">&copy; {new Date().getFullYear()} Aspirants Q. Built for production.</p>
      </footer>
    </div>
  );
}
