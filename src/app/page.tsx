import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, BrainCircuit, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dashboardLink = '/login';
  if (user) {
     dashboardLink = user.user_metadata?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ExamPlatform</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href={dashboardLink}>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-20 lg:py-32 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
            AI-Powered Document Extraction
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Online Examinations</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            Upload your question papers and answer keys. Our AI automatically extracts, maps, and generates a production-grade online exam in seconds. Strict, secure, and scalable.
          </p>
          <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
            <Link href={dashboardLink} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run exams</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Built for educators and institutions who demand precision and reliability without the manual data entry overhead.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
                <BrainCircuit className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Automated Extraction</h3>
                <p className="text-slate-600">Simply upload a PDF or image of your exam paper and answer key. The AI extracts questions, options, and maps the correct answers automatically.</p>
              </div>
              
              <div className="p-6 border rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
                <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Server-Authoritative</h3>
                <p className="text-slate-600">Strict timing controlled by the server. Students cannot manipulate the clock, and exams auto-submit exactly when time runs out.</p>
              </div>
              
              <div className="p-6 border rounded-2xl bg-slate-50 hover:shadow-md transition-shadow">
                <CheckCircle className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Advanced Scoring</h3>
                <p className="text-slate-600">Support for positive and negative marking. Instantly evaluate thousands of attempts without manual grading.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <span className="text-xl font-bold text-white tracking-tight">ExamPlatform</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ExamPlatform. Built for production.</p>
      </footer>
    </div>
  );
}
