import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Code, Palette, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-900 selection:text-white">
      <header className="py-20 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-left md:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="h-20 w-20 rounded-2xl bg-slate-900 mx-auto md:mx-auto flex items-center justify-center text-white text-2xl font-black shadow-xl rotate-3">
              TC
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Professional <br />Portfolio</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Full Stack Engineer & Interface Designer specializing in high-impact digital products.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button className="h-12 w-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300">
                <Github size={20} />
              </button>
              <button className="h-12 w-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300">
                <Linkedin size={20} />
              </button>
              <button className="h-12 w-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300">
                <Mail size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="py-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-32">
        {/* Core Expertise */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 space-y-4"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Code size={24} />
            </div>
            <h3 className="font-black text-slate-900">Engineering</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Scalable system design with TypeScript, React, and serverless backends.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 space-y-4"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Palette size={24} />
            </div>
            <h3 className="font-black text-slate-900">Branding</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Crafting cohesive visual identities and design languages for the web.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 space-y-4"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Zap size={24} />
            </div>
            <h3 className="font-black text-slate-900">Architecture</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Geospatial data visualization and real-time collaborative tools.</p>
          </motion.div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-12">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-black text-slate-900">Selected Work</h2>
            <Link to="/" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="group relative bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="flex flex-col md:flex-row">
              <div className="p-10 md:p-14 flex-1 space-y-6">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest">Case Study</span>
                  <span className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">GIS</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900">LOMA - Ghana Map</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  An award-winning platform connecting youth with local architectural and vocational opportunities through geographical data.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-sm group/btn">
                  Launch Project
                  <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                </Link>
              </div>
              <div className="w-full md:w-[40%] bg-slate-100 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1526778545894-6297aa49da52?auto=format&fit=crop&q=80&w=800" 
                  alt="Project LOMA"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Simple CTA */}
        <section className="py-20 rounded-[3rem] bg-slate-900 text-white text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10 px-8">
            <h2 className="text-4xl font-black">Want to collaborate?</h2>
            <p className="text-slate-400 max-w-lg mx-auto font-medium">I'm always open to discussing new projects, creative ideas or architectural challenges.</p>
            <div className="pt-6">
              <a href="mailto:hello@example.com" className="inline-block bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform active:scale-95">
                Say Hello
              </a>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Built with AI Studio Architecture © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
