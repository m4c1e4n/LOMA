import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Search, MapPin, Briefcase, GraduationCap, Filter, Navigation, Info, ExternalLink, AlertCircle, Plus, Minus, List, CheckCircle2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix for Leaflet default icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Opportunity {
  id: string;
  title: string;
  companyName: string;
  type: 'job' | 'internship' | 'training';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  contact: string;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOps, setFilteredOps] = useState<Opportunity[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number; timestamp: number }>({
    center: [5.6037, -0.1870], // Accra default
    zoom: 12,
    timestamp: Date.now()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOp, setSelectedOp] = useState<Opportunity | null>(null);
  const [showList, setShowList] = useState(false); // For mobile list toggle
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    if (auth) {
      onAuthStateChanged(auth, (user) => setCurrentUser(user));
    }
    fetchOpportunities();
    getUserLocation();
  }, []);

  useEffect(() => {
    let result = opportunities;
    if (searchQuery) {
      result = result.filter(op => 
        op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(op => op.type === typeFilter);
    }
    setFilteredOps(result);
  }, [searchQuery, typeFilter, opportunities]);

  const fetchOpportunities = async () => {
    setLoading(true);
    setFetchError(null);
    const path = 'opportunities';
    const mockData: Opportunity[] = [
      { id: '1', title: 'Frontend Developer Internship', companyName: 'Tech-Hub Accra', type: 'internship', location: { lat: 5.6037, lng: -0.1870, address: 'Osu, Accra' }, description: 'Learn modern React and Tailwind. 3-month program.', contact: 'hr@techhubaccra.com' },
      { id: '2', title: 'Agro-Business Trainee', companyName: 'Green Ghana Kumasi', type: 'training', location: { lat: 6.6666, lng: -1.6163, address: 'Kumasi Kumasi' }, description: 'Hands-on training in sustainable farming methods.', contact: 'info@greenghana.com' },
      { id: '3', title: 'Junior Electrician', companyName: 'Power Solutions Ltd', type: 'job', location: { lat: 5.5560, lng: -0.1969, address: 'James Town, Accra' }, description: 'Full-time role for entry-level electricians.', contact: '024-555-0123' },
      { id: '4', title: 'Customer Support Specialist', companyName: 'FinTech Connect', type: 'job', location: { lat: 6.6905, lng: -1.6244, address: 'Adum, Kumasi' }, description: 'Passionate about helping people? Join our support team.', contact: 'apply@fintechconnect.gh' },
      { id: '5', title: 'Plumbing Apprentice', companyName: 'ProPlumb Accra', type: 'training', location: { lat: 5.6148, lng: -0.2057, address: 'Ridge, Accra' }, description: 'Learn the trade from masters. Stipend provided.', contact: 'jobs@proplumb.com' },
      { id: '6', title: 'Solar Technician Intern', companyName: 'SunPower Ghana', type: 'internship', location: { lat: 5.6500, lng: -0.1800, address: 'East Legon, Accra' }, description: 'Gain skills in solar panel installation and maintenance.', contact: 'careers@sunpower.com' },
      { id: '7', title: 'Data Entry Clerk', companyName: 'BPO Ghana', type: 'job', location: { lat: 5.6720, lng: -0.0120, address: 'Tema Community 1' }, description: 'Fast-paced data entry role for meticulous individuals.', contact: 'recruitment@bpoghana.com' },
      { id: '8', title: 'Hospitality Management Trainee', companyName: 'Golden Tulip', type: 'training', location: { lat: 6.6850, lng: -1.6100, address: 'Kumasi Ridge' }, description: 'Comprehensive training in hotel operations.', contact: 'hr@goldentulipt.com' },
      { id: '9', title: 'Mobile Repair Apprentice', companyName: 'FixIt Solutions', type: 'training', location: { lat: 5.5800, lng: -0.2100, address: 'Makola, Accra' }, description: 'Learn to repair smartphones and tablets.', contact: 'apply@fixit.com' },
      { id: '10', title: 'Graduate Trainee (Marketing)', companyName: 'BrandHub Ghana', type: 'internship', location: { lat: 5.6100, lng: -0.2300, address: 'Danesoman, Accra' }, description: 'Creative role for aspiring marketing professionals.', contact: 'hello@brandhub.com' }
    ];

    try {
      if (!db) {
        setOpportunities(mockData);
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
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        if (data.length === 0) {
          // Seed some data if empty
          setOpportunities(mockData);
        } else {
          setOpportunities(data);
        }
      }
    } catch (err: any) {
      if (err.message.includes('{')) {
        setFetchError("Permission denied or database error.");
      } else {
        setFetchError("We're having trouble loading jobs. Please check your connection.");
      }
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapView({ center: [latitude, longitude], zoom: 14, timestamp: Date.now() });
          setLocError(null);
        },
        (error) => {
          setLocError("Location access denied. Centered on Accra for now.");
          console.error('Location error:', error);
        }
      );
    } else {
      setLocError("Your browser doesn't support geolocation.");
    }
  };

  const handleApply = async (op: Opportunity) => {
    if (!currentUser) {
      alert('Please sign in to apply.');
      return;
    }
    setLoading(true);
    try {
      if (!db) throw new Error('Database not initialized');
      
      const userId = currentUser.uid;
      const opportunityId = op.id;
      const applicationId = `${userId}_${opportunityId}`;
      const appRef = doc(db, 'applications', applicationId);
      const userRef = doc(db, 'users', userId);

      try {
        // 1. Create Application document
        await setDoc(appRef, {
          userId,
          opportunityId,
          status: 'pending',
          appliedAt: serverTimestamp()
        });

        // 2. Update User Profile tracking
        await updateDoc(userRef, {
          appliedJobs: arrayUnion(opportunityId)
        });

        alert(`Application submitted successfully! ${op.companyName} will review your profile.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `applications/${applicationId}`);
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (op: Opportunity) => {
    if (!currentUser) {
      alert('Please sign in to save opportunities.');
      return;
    }
    setLoading(true);
    try {
      if (!db) throw new Error('Database not initialized');
      const userRef = doc(db, 'users', currentUser.uid);
      
      try {
        await updateDoc(userRef, {
          favorites: arrayUnion(op.id)
        });
        alert('Opportunity saved to your profile!');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    } catch (err: any) {
      console.error('Error saving opportunity:', err);
      alert('Failed to save opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase size={16} className="text-blue-500" />;
      case 'internship': return <GraduationCap size={16} className="text-green-500" />;
      case 'training': return <Info size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 overflow-y-auto z-10 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-blue mb-4">Find Opportunities</h1>
          
          <AnimatePresence>
            {fetchError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-600"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Fetch Error</p>
                  <p>{fetchError}</p>
                  <button onClick={fetchOpportunities} className="mt-1 font-bold underline hover:no-underline">Try Again</button>
                </div>
              </motion.div>
            )}

            {locError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 text-xs text-amber-700"
              >
                <Navigation size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Location Access</p>
                  <p>{locError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search jobs, skill, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-blue transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'job', 'internship', 'training'].map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    typeFilter === f 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All Types' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Near You ({filteredOps.length})</p>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-xl" />)}
              </div>
            ) : filteredOps.length > 0 ? (
              <div className="space-y-3">
                {filteredOps.map(op => (
                  <motion.div
                    key={op.id}
                    layoutId={op.id}
                    onClick={() => {
                      setMapView({ center: [op.location.lat, op.location.lng], zoom: 15, timestamp: Date.now() });
                      setSelectedOp(op);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                      selectedOp?.id === op.id ? 'border-brand-blue bg-blue-50/50' : 'border-transparent bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        op.type === 'job' ? 'bg-blue-100 text-blue-700' :
                        op.type === 'internship' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {op.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">{op.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{op.companyName}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {op.location.address}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={24} />
                </div>
                <p className="text-sm text-slate-500">No opportunities found match your criteria</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-slate-200">
        <MapContainer 
          center={mapView.center} 
          zoom={mapView.zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ChangeView center={mapView.center} zoom={mapView.zoom} />
          
          {userLocation && (
            <Circle 
              center={userLocation} 
              radius={100} 
              pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', fillOpacity: 0.5, weight: 2 }} 
            />
          )}

          {filteredOps.map(op => (
            <Marker 
              key={op.id} 
              position={[op.location.lat, op.location.lng]}
              eventHandlers={{
                click: () => setSelectedOp(op),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-brand-blue mb-1 leading-tight">{op.title}</h3>
                  <p className="text-xs text-slate-600 font-medium mb-2">{op.companyName}</p>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{op.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleApply(op)}
                      className="bg-brand-blue text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => handleSave(op)}
                      className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      <Heart size={14} />
                      Save
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Custom Zoom Controls */}
        <div className="absolute top-8 right-8 z-[2000] flex flex-col gap-2">
          <button 
            onClick={() => setMapView(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18), timestamp: Date.now() }))}
            className="p-3 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-600 hover:text-brand-blue transition-all active:scale-90"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setMapView(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 5), timestamp: Date.now() }))}
            className="p-3 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-600 hover:text-brand-blue transition-all active:scale-90"
          >
            <Minus size={20} />
          </button>
        </div>

        {/* User Location FAB */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            getUserLocation();
          }}
          title="Find my location"
          className="absolute bottom-8 right-8 z-[2000] p-4 bg-white rounded-full shadow-2xl border border-slate-200 text-brand-blue hover:text-blue-700 transition-all active:scale-90 hover:scale-110 cursor-pointer flex items-center justify-center"
        >
          <Navigation size={24} />
        </button>

        {/* Mobile List Toggle */}
        {!selectedOp && (
          <button 
            onClick={() => setShowList(!showList)}
            className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full shadow-2xl font-bold active:scale-95 transition-all"
          >
            <List size={20} />
            {showList ? 'Show Map' : 'Show List'}
          </button>
        )}

        {/* Mobile List View Overlay */}
        <AnimatePresence>
          {showList && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="md:hidden absolute inset-0 z-[2500] bg-white overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-slate-900">Local Openings</h2>
                   <button onClick={() => setShowList(false)} className="p-2 bg-slate-100 rounded-xl font-bold text-slate-600">
                     Close
                   </button>
                </div>
                <div className="space-y-4">
                  {filteredOps.map(op => (
                    <div 
                      key={op.id}
                      onClick={() => {
                        setMapView({ center: [op.location.lat, op.location.lng], zoom: 15, timestamp: Date.now() });
                        setSelectedOp(op);
                        setShowList(false);
                      }}
                      className="p-5 rounded-2xl border-2 border-slate-100 bg-white shadow-sm active:border-brand-blue transition-colors"
                    >
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        op.type === 'job' ? 'bg-blue-100 text-blue-600' : 
                        op.type === 'internship' ? 'bg-purple-100 text-purple-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {op.type}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-2">{op.title}</h3>
                      <p className="text-sm text-brand-blue font-medium">{op.companyName}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <MapPin size={12} />
                        <span>{op.location.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Detail Modal (Mobile) */}
        <AnimatePresence>
          {selectedOp && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 inset-x-0 z-[2001] bg-white rounded-t-3xl shadow-2xl p-6 md:hidden border-t border-slate-100"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setSelectedOp(null)} />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                    selectedOp.type === 'job' ? 'bg-blue-100 text-blue-700' :
                    selectedOp.type === 'internship' ? 'bg-green-100 text-green-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedOp.type}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{selectedOp.title}</h2>
                  <p className="text-brand-blue font-medium">{selectedOp.companyName}</p>
                </div>
                <button onClick={() => setSelectedOp(null)} className="p-2 text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={20} className="text-slate-400" />
                  <span>{selectedOp.location.address}</span>
                </div>
                <div className="text-slate-600 leading-relaxed text-sm">
                  {selectedOp.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleApply(selectedOp)}
                  className="bg-brand-blue text-white py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Apply
                </button>
                <button 
                  onClick={() => handleSave(selectedOp)}
                  className="flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all whitespace-nowrap"
                >
                  <Heart size={20} />
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

