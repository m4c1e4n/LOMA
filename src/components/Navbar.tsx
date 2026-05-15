import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Map, BookOpen, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white">
              <Map size={24} />
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-brand-blue sm:block">LOMA</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-6">
          <Link to="/map" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-blue">
            <Map size={18} />
            <span className="hidden sm:inline">Map</span>
          </Link>
          <Link to="/skills" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-blue">
            <BookOpen size={18} />
            <span className="hidden sm:inline">Hub</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-4 ml-2 pl-4 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-blue">
                <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <UserIcon size={16} />
                </div>
                <span className="hidden md:inline">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
            >
              Sign In
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
