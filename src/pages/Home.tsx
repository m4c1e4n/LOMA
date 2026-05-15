import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Map, BookOpen, ChevronRight, Briefcase, GraduationCap, Globe, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-light py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-8"
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-600 ring-1 ring-inset ring-blue-200">
                  LOMA Ghana
                </span>
                <div className="flex -space-x-2 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src={
                        i === 1 ? "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&q=80&w=100" :
                        i === 2 ? "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=100" :
                        "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&q=80&w=100"
                      }
                      alt="User avatar"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                    +2k
                  </div>
                </div>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900 sm:text-8xl leading-[0.95]">
                Connecting <br />
                Ghana's <span className="text-blue-600">Youth</span> <br />
                to Success.
              </h1>
              <p className="mx-auto lg:mx-0 max-w-2xl text-xl text-slate-600 leading-relaxed font-medium">
                Find hiring companies, internships, and on-the-job training in your neighborhood. Built to help Ghanaian youth master skills and find meaningful work.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/map"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-brand-blue px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
                >
                  <Map size={24} />
                  Explore the Live Map
                </Link>
                <Link
                  to="/skills"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:border-brand-blue hover:text-brand-blue active:scale-95"
                >
                  Visit Skill-Building Hub
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 relative w-full lg:min-h-[600px] flex items-center justify-center"
            >
              <div className="relative z-10 w-full max-w-lg">
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white mb-[-120px] ml-[-40px] z-20 hidden lg:block">
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" 
                    alt="Young Ghanaian professional working" 
                    className="w-full h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="relative z-30 overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-200 border border-slate-100 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-50 transition-transform hover:translate-x-2">
                       <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                         <Briefcase size={24} />
                       </div>
                       <div className="text-left">
                         <h4 className="font-bold text-slate-900">Job Match</h4>
                         <p className="text-xs text-slate-500">Real-time local listings</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-50 transition-transform hover:translate-x-2">
                       <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                         <GraduationCap size={24} />
                       </div>
                       <div className="text-left">
                         <h4 className="font-bold text-slate-900">Skill Hub</h4>
                         <p className="text-xs text-slate-500">Curated Ghana-focused courses</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-blue-400/20 blur-[120px] rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to get ahead</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">We provide the tools and information to help you find your footing in Ghana's emerging economy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-xl group">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Map Tracking</h3>
              <p className="text-slate-600">Visual access to active job openings and training centers across Accra, Kumasi, and beyond.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-xl group">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ghana-Focused Learning</h3>
              <p className="text-slate-600">Free resources specifically curated for local industries like Agriculture, Trade, and Tech.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-xl group">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Join the Community</h3>
              <p className="text-slate-600">Track your applications, save your progress, and get notified of new local opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-brand-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl italic">Our Story</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                LOMA (Local Opportunities Map App) was founded with a single mission: to ensure that no talented young Ghanaian is left behind due to a lack of information. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                We noticed that while many companies were hiring, the information wasn't reaching the youth who needed it most. LOMA bridges this gap by providing a transparent, visual, and accessible platform for everyone.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl scale-95 hover:scale-100 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800" 
                alt="Ghanaian youth collaborating" 
                className="w-full h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-extrabold sm:text-5xl mb-8">Ready to start your journey?</h2>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-5 text-xl font-black text-brand-blue shadow-2xl transition-all hover:bg-blue-50 active:scale-95"
          >
            Create Your Account
            <ChevronRight size={24} />
          </Link>
          <p className="mt-8 text-slate-400">It's free and always will be for the youth of Ghana.</p>
        </div>
      </section>
    </div>
  );
}
