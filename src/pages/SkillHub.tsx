import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Play, BookOpen, ExternalLink, Filter, Laptop, Sprout, Hammer, BarChart, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: 'Tech' | 'Agriculture' | 'Trade' | 'Business';
  videoUrl?: string;
  externalUrl?: string;
  duration?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CATEGORIES = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'Tech', name: 'Technology', icon: Laptop },
  { id: 'Agriculture', name: 'Agriculture', icon: Sprout },
  { id: 'Trade', name: 'Trades & Skills', icon: Hammer },
  { id: 'Business', name: 'Business', icon: BarChart },
];

export default function SkillHub() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) fetchUserData(user.uid);
      });
    }
    fetchResources();
  }, []);

  const fetchUserData = async (uid: string) => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setCompletedIds(userDoc.data().completedResources || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    let result = resources;
    if (searchQuery) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory !== 'all') {
      result = result.filter(r => r.category === activeCategory);
    }
    setFilteredResources(result);
  }, [searchQuery, activeCategory, resources]);

  const fetchResources = async () => {
    const path = 'learningResources';
    const mockData: LearningResource[] = [
      { id: 'r1', title: 'Web Development Basics', description: 'Learn HTML, CSS, and basic programming to start your tech career.', category: 'Tech', videoUrl: 'https://youtube.com/watch?v=khcode1', duration: '5h', level: 'Beginner' },
      { id: 'r2', title: 'Modern Poultry Farming', description: 'Comprehensive guide to starting and managing a poultry farm in Ghana.', category: 'Agriculture', externalUrl: 'https://example.com/poultry', duration: '2h', level: 'Intermediate' },
      { id: 'r3', title: 'Entrepreneurship 101', description: 'Key principles of starting a small business and managing finances.', category: 'Business', videoUrl: 'https://youtube.com/watch?v=biz101', duration: '3h', level: 'Beginner' },
      { id: 'r4', title: 'Advanced Carpentry Techniques', description: 'Master intricate woodworking and furniture design.', category: 'Trade', videoUrl: 'https://youtube.com/watch?v=woodwork', duration: '8h', level: 'Advanced' },
      { id: 'r5', title: 'Digital Marketing Essentials', description: 'How to use social media and SEO to grow your local brand.', category: 'Tech', videoUrl: 'https://youtube.com/watch?v=mktg1', duration: '4h', level: 'Beginner' },
      { id: 'r6', title: 'Cocoa Farm Management', description: 'Expert advice on increasing yield and quality for cocoa farmers.', category: 'Agriculture', externalUrl: 'https://example.com/cocoa', duration: '10h', level: 'Intermediate' },
      { id: 'r7', title: 'Basic Electrical Wiring', description: 'Safety first: learn the fundamentals of house wiring.', category: 'Trade', videoUrl: 'https://youtube.com/watch?v=electric', duration: '6h', level: 'Intermediate' },
      { id: 'r8', title: 'Financial Literacy for Youth', description: 'Budgeting, saving, and investing for your future.', category: 'Business', videoUrl: 'https://youtube.com/watch?v=money', duration: '2h', level: 'Beginner' },
      { id: 'r9', title: 'Auto Mechanic Repairs', description: 'Diagnose and fix common car engine issues.', category: 'Trade', videoUrl: 'https://youtube.com/watch?v=cars', duration: '12h', level: 'Advanced' },
      { id: 'r10', title: 'Introduction to Python', description: 'Step-by-step programming tutorial for coding beginners.', category: 'Tech', videoUrl: 'https://youtube.com/watch?v=python', duration: '7h', level: 'Beginner' }
    ];

    try {
      if (!db) {
        setResources(mockData);
        setLoading(false);
        return;
      }
      const q = query(collection(db, path));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }

      if (querySnapshot) {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningResource));
        
        if (data.length === 0) {
          // Seed mock data
          setResources(mockData);
        } else {
          setResources(data);
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // Fallback to mock data if it's a permission error during initial load/seed dev
      setResources(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = (resource: LearningResource) => {
    if (!currentUser) {
      navigate('/auth', { state: { from: location } });
      return;
    }
    window.open(resource.videoUrl || resource.externalUrl, '_blank');
  };

  const handleMarkCompleted = async (resourceId: string) => {
    if (!currentUser || !db) return;
    setActionLoading(resourceId);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        completedResources: arrayUnion(resourceId)
      });
      setCompletedIds(prev => [...prev, resourceId]);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 relative overflow-hidden rounded-[40px] bg-slate-900 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" 
              alt="Ghanaian students learning" 
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </div>
          
          <div className="relative z-10 px-8 py-20 sm:px-12 text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-4 py-1 text-sm font-bold text-blue-400 ring-1 ring-inset ring-blue-500/30 mb-6">
                LOMA Academy
              </span>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6">
                Master the Skills for <br />
                <span className="text-blue-400">Ghana's Future.</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Curated resources to help you master new skills, from Tech to Trade, specifically designed for the Ghanaian job market.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="What do you want to learn today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-6 text-lg shadow-xl shadow-slate-200 outline-none ring-brand-blue/30 transition-all focus:ring-4"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    activeCategory === cat.id 
                    ? 'bg-brand-blue text-white scale-105 shadow-brand-blue/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-brand-blue'
                  }`}
                >
                  <Icon size={18} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 w-full bg-white/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col rounded-3xl bg-white p-6 shadow-xl shadow-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    res.category === 'Tech' ? 'bg-blue-100 text-blue-600' :
                    res.category === 'Agriculture' ? 'bg-green-100 text-green-600' :
                    res.category === 'Trade' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {res.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <BookOpen size={14} />
                    {res.duration} • {res.level}
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                  {res.title}
                </h3>
                <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-500">
                  {res.description}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStartCourse(res)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100"
                  >
                    {res.videoUrl ? <Play size={18} fill="currentColor" /> : <ExternalLink size={18} />}
                    Start
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => handleMarkCompleted(res.id)}
                      disabled={completedIds.includes(res.id) || actionLoading === res.id}
                      className={`p-3.5 rounded-2xl transition-all active:scale-90 flex items-center justify-center ${
                        completedIds.includes(res.id)
                        ? 'bg-green-100 text-green-600 cursor-default'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={completedIds.includes(res.id) ? "Completed" : "Mark as completed"}
                    >
                      {actionLoading === res.id ? (
                        <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={24} />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-slate-100">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No resources found</h3>
            <p className="text-slate-500">Try adjusting your category or search query.</p>
          </div>
        )}
      </div>

      {!currentUser && (
        <div className="mt-20 mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-brand-blue to-blue-600 p-8 text-center text-white shadow-2xl shadow-blue-200">
          <h2 className="mb-4 text-3xl font-extrabold">Ready to take the next step?</h2>
          <p className="mb-8 text-lg opacity-90">Sign in to track your progress, save your favorite courses, and get personalized recommendations.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-brand-blue transition-all hover:bg-blue-50 active:scale-95 shadow-xl"
          >
            Create Your Account Now
          </button>
        </div>
      )}
    </div>
  );
}
