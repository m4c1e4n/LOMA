import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { User as UserIcon, Mail, Calendar, Briefcase, GraduationCap, MapPin, ChevronRight, Settings, Star, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  favorites: string[];
  completedResources: string[];
  appliedJobs: string[];
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  companyName: string;
  type: string;
  location: { address: string };
}

interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface AppliedOpportunity extends Opportunity {
  applicationId: string;
  status: Application['status'];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState<AppliedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchProfile(u.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      if (!db) return;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setProfile(profileData);
        
        // Fetch applications for this user
        const appsQuery = query(collection(db, 'applications'), where('userId', '==', uid));
        const appsSnapshot = await getDocs(appsQuery);
        const apps = appsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Application));
        
        if (apps.length > 0) {
          const ops: AppliedOpportunity[] = [];
          for (const app of apps) {
             const opDoc = await getDoc(doc(db, 'opportunities', app.opportunityId));
             if (opDoc.exists()) {
               const opData = opDoc.data() as Opportunity;
               ops.push({ 
                 ...opData, 
                 id: opDoc.id, 
                 applicationId: app.id, 
                 status: app.status || 'pending' 
               });
             } else {
               // Handle mock/missing data case for demo
               const mockOps = [
                { id: '1', title: 'Frontend Developer Internship', companyName: 'Tech-Hub Accra', type: 'internship', location: { address: 'Osu, Accra' } },
                { id: '2', title: 'Agro-Business Trainee', companyName: 'Green Ghana Kumasi', type: 'training', location: { address: 'Kumasi Central' } },
                { id: '3', title: 'Junior Electrician', companyName: 'Power Solutions Ltd', type: 'job', location: { address: 'James Town, Accra' } }
               ];
               const found = mockOps.find(m => m.id === app.opportunityId);
               if (found) {
                 ops.push({ 
                   ...found, 
                   applicationId: app.id, 
                   status: app.status || 'pending' 
                 } as any);
               }
             }
          }
          setAppliedOpportunities(ops);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    if (!db) return;
    setUpdatingStatus(applicationId);
    const path = `applications/${applicationId}`;
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus
      });
      
      // Update local state
      setAppliedOpportunities(prev => 
        prev.map(op => op.applicationId === applicationId ? { ...op, status: newStatus } : op)
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={14} />, label: 'Accepted' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={14} />, label: 'Rejected' };
      case 'reviewed':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Eye size={14} />, label: 'Reviewed' };
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Clock size={14} />, label: 'Pending' };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* User Bio Card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-white p-8 shadow-xl shadow-slate-100 border border-slate-100">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-brand-blue to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
                  {profile.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{profile.displayName || 'Youth User'}</h2>
                <p className="text-sm font-medium text-slate-500">{profile.email}</p>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={18} className="text-slate-400" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-black text-brand-blue">{(profile.appliedJobs || []).length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applications</div>
                </div>
                <div className="text-center border-l border-slate-100">
                  <div className="text-2xl font-black text-brand-green">{profile.completedResources.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed</div>
                </div>
              </div>

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
                <Settings size={18} />
                Edit Profile
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-2 space-y-8">
            {/* Dashboard Header */}
            <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-100 border border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="text-brand-blue" size={24} />
                Your Applications
              </h3>
              
              {appliedOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {appliedOpportunities.map((op) => (
                    <div key={op.applicationId} className="group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-lg border border-transparent hover:border-blue-100 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                          op.type === 'job' ? 'bg-blue-100 text-blue-600' :
                          op.type === 'internship' ? 'bg-green-100 text-green-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {op.type === 'job' ? <Briefcase size={24} /> : <GraduationCap size={24} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{op.title}</h4>
                          <p className="text-sm text-slate-500 font-medium">{op.companyName} • {op.location.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <div className="relative group/status">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${getStatusConfig(op.status).color}`}>
                            {getStatusConfig(op.status).icon}
                            {getStatusConfig(op.status).label}
                          </div>
                          
                          {/* Status Actions Overlay on Hover */}
                          <div className="absolute right-0 top-full mt-2 hidden group-hover/status:flex flex-col bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-30 min-w-[140px]">
                            <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Update Status</p>
                            {(['pending', 'reviewed', 'accepted', 'rejected'] as Application['status'][]).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateApplicationStatus(op.applicationId, s)}
                                disabled={updatingStatus === op.applicationId}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                  op.status === s ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {getStatusConfig(s).icon}
                                {getStatusConfig(s).label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Link to="/map" className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-blue transition-colors">
                          <ChevronRight size={24} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Briefcase size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">You haven't applied to any roles yet.</p>
                  <Link to="/map" className="inline-block mt-4 text-brand-blue font-bold hover:underline">Explore the map</Link>
                </div>
              )}
            </div>

            {/* Progress Card */}
            <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-100 border border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">Learning Path</h3>
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative h-32 w-32 mb-6">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="364.4"
                      strokeDashoffset={364.4 * (1 - profile.completedResources.length / 5)}
                      className="text-brand-green transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{Math.round((profile.completedResources.length / 5) * 100)}%</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Current Progress</p>
                <Link to="/skills" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green/10 px-6 py-3 text-sm font-bold text-brand-green hover:bg-brand-green hover:text-white transition-all">
                  Resume Learning
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
