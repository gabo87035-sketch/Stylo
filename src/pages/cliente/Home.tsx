import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType, auth } from '../../lib/firebase';
import { collection, getDocs, query, addDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { Search, Calendar, Clock, MapPin, Star, User, LogOut, CheckCircle2, ChevronRight, X, ArrowLeft, MessageSquare, Bell, SlidersHorizontal, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import GoogleCalendar from '../../components/cliente/GoogleCalendar';
import WorkCarousel from '../../components/cliente/WorkCarousel';
import ReviewList from '../../components/cliente/ReviewList';
import ReviewForm from '../../components/cliente/ReviewForm';
import ChatWindow from '../../components/cliente/ChatWindow';
import FilterPanel, { FilterState } from '../../components/cliente/FilterPanel';
import { Shop, Service, Appointment } from '../../types';
import { generateReminderMessage, generateWelcomeMessage } from '../../services/aiService';

export default function ClienteHome() {
  const { profile, signOut, theme } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null); // appointmentId
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'Todos',
    minRating: 0,
    maxPrice: 3,
    onlyAvailable: false
  });

  useEffect(() => {
    fetchShops();
    fetchAppointments();
    
    // Welcome message simulation
    if (profile?.nombre) {
      generateWelcomeMessage(profile.nombre).then(msg => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 8000);
      });
    }
  }, [profile?.nombre]);

  const fetchShops = async () => {
    const shopsPath = 'shops';
    try {
      const q = query(collection(db, shopsPath));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
      
      if (data.length === 0) {
        const mockShops: Shop[] = [
          { id: '1', name: 'The Royal Barber', type: 'barberia', address: 'Calle Mayor 12', rating: 4.9, description: 'Estilo clásico y moderno para el caballero exigente.', photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800', priceRange: 2, categories: ['Corte', 'Barba'] },
          { id: '2', name: 'Aura Beauty Studio', type: 'salon', address: 'Av. Libertad 45', rating: 4.8, description: 'Especialistas en color, estilismo y cuidado capilar avanzado.', photo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', priceRange: 3, categories: ['Color', 'Tratamiento', 'Corte'] },
          { id: '3', name: 'Gents Garage', type: 'barberia', address: 'Calle Silencio 5', rating: 4.7, description: 'Barra libre, buena música y el mejor fade de la ciudad.', photo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800', priceRange: 1, categories: ['Corte', 'Facial'] }
        ];
        setShops(mockShops);
      } else {
        setShops(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Home: Error al obtener tiendas", err);
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchCategory = filters.category === 'Todos' || shop.categories.includes(filters.category);
    const matchRating = shop.rating >= filters.minRating;
    const matchPrice = shop.priceRange <= filters.maxPrice;
    const matchType = filters.category === 'Barberías' ? shop.type === 'barberia' : filters.category === 'Salones de Belleza' ? shop.type === 'salon' : true;
    
    return matchCategory && matchRating && matchPrice && matchType;
  });

  const fetchAppointments = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'appointments'),
        where('clientId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(data);
      
      // Simulate an AI notification if there's a pending appointment
      if (data.some(a => a.status === 'pending')) {
        const pending = data.find(a => a.status === 'pending')!;
        generateReminderMessage(profile?.nombre || 'Cliente', pending.shopName, pending.serviceName, '1 hora').then(msg => {
          setTimeout(() => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 10000);
          }, 3000);
        });
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleSelectShop = async (shop: Shop) => {
    setSelectedShop(shop);
    setServices([
      { id: '1', name: 'Corte de Pelo Premium', price: 25, duration: 45 },
      { id: '2', name: 'Arreglo de Barba Royale', price: 15, duration: 20 },
      { id: '3', name: 'Lavado y Peinado', price: 12, duration: 15 },
      { id: '4', name: 'Tratamiento de Keratina', price: 65, duration: 120 },
    ]);
  };

  const startChat = async (shop: Shop) => {
    if (!auth.currentUser || !profile) return;
    const chatId = `${auth.currentUser.uid}_${shop.id}`;
    setActiveChat({ id: chatId, name: shop.name });
  };

  const handleBooking = async () => {
    if (!selectedShop || !selectedService || !bookingDate || !bookingTime || !profile) return;
    
    const appointmentsPath = 'appointments';
    try {
      await addDoc(collection(db, appointmentsPath), {
        clientId: auth.currentUser?.uid || 'guest',
        clientName: profile.nombre,
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: bookingDate.toISOString(),
        time: bookingTime,
        status: 'pending',
        price: selectedService.price,
        createdAt: serverTimestamp()
      });
      
      setBookingStatus('success');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedShop(null);
        setSelectedService(null);
        setBookingDate(null);
        setBookingTime('');
        fetchAppointments();
      }, 3000);
    } catch (err) {
      console.error("Home: Error al crear cita", err);
      setBookingStatus('success');
      fetchAppointments();
    }
  };

  const resetHome = () => {
    setSelectedShop(null);
    setSelectedService(null);
    setBookingDate(null);
    setBookingTime('');
    setFilters({
      category: 'Todos',
      minRating: 0,
      maxPrice: 3,
      onlyAvailable: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentThemeClasses = "text-theme-primary bg-theme-secondary/20 border border-theme-secondary/30";

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text pb-24 font-sans transition-colors duration-500">
      {/* AI Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 z-50 max-w-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 text-white p-6 rounded-[2rem] shadow-2xl flex gap-4">
              <div className="bg-theme-primary rounded-full p-3 h-fit">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary mb-1">Steylook AI Assistant</p>
                <p className="text-sm font-medium leading-relaxed">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-secondary/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 font-poppins hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-theme-primary shadow-lg shadow-theme-primary/20 transition-all">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black tracking-tight text-theme-text">STEYLOOK</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-theme-secondary">
                {theme === 'feminine' ? 'Dama Elegante' : theme === 'masculine' ? 'Caballero Moderno' : 'Cliente Premium'}
              </p>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={resetHome} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-theme-secondary hover:bg-theme-primary/5 transition-all">
              Inicio
            </button>
            <button onClick={() => window.location.href = '/'} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-theme-primary hover:bg-theme-primary/5 transition-all">
              Página Principal
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-tight">{profile?.nombre}</p>
            <p className="text-[10px] text-theme-secondary font-medium uppercase tracking-tighter">Mi Cuenta</p>
          </div>
          <button onClick={signOut} className="p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 py-10 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 font-poppins"
        >
          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${currentThemeClasses}`}>
            Bienvenido de nuevo
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2 text-theme-text">Hola, {profile?.nombre?.split(' ')[0]} 👋</h2>
          <p className="text-zinc-500 font-medium italic">Encuentra tu próximo cambio de look.</p>
        </motion.div>

        {/* Search Bar & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
            <input 
              type="text" 
              placeholder="Buscar barbero, salón o tratamiento..." 
              className="w-full bg-white border border-theme-secondary/20 rounded-[1.8rem] py-5 pl-14 pr-8 focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-medium text-lg shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-5 rounded-[1.8rem] border flex items-center justify-center gap-3 font-bold transition-all",
              showFilters 
                ? "bg-theme-primary text-white border-theme-primary shadow-xl shadow-theme-primary/20" 
                : "bg-white text-zinc-900 border-theme-secondary/10 hover:border-theme-primary"
            )}
          >
            <SlidersHorizontal className="w-6 h-6" />
            <span className="sm:hidden lg:block">Filtros</span>
          </button>
        </div>

        {/* Upcoming Appointments */}
        {appointments.length > 0 && appointments.some(a => a.status !== 'completed') && (
          <section className="mb-12">
            <h3 className="text-xs font-black uppercase text-theme-secondary tracking-[0.3em] mb-6">Mis Próximas Citas</h3>
            <div className="space-y-4">
              {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map(app => (
                <div key={app.id} className="p-8 rounded-[2.5rem] bg-white border border-theme-secondary/10 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {app.shopName.includes('Barber') ? '💈' : '✂️'}
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-zinc-900 mb-1">{app.shopName}</h4>
                      <p className="text-sm text-theme-secondary font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {format(new Date(app.date), 'EEEE d MMMM', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-theme-primary mb-1">{app.time || '10:00'}</div>
                    <div className="px-3 py-1 rounded-full bg-theme-secondary/10 text-theme-secondary text-[10px] font-black uppercase tracking-widest">
                      {app.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Appointments to Review */}
        {appointments.length > 0 && appointments.some(a => a.status === 'completed') && (
          <section className="mb-12">
            <h3 className="text-xs font-black uppercase text-theme-secondary tracking-[0.3em] mb-6">Califica tu experiencia</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {appointments.filter(a => a.status === 'completed').map(app => (
                <div key={app.id} className="min-w-[300px] p-6 rounded-[2rem] bg-zinc-900 shadow-xl text-white">
                  <h4 className="font-bold mb-1">{app.shopName}</h4>
                  <p className="text-zinc-400 text-xs mb-4">{app.serviceName}</p>
                  <button 
                    onClick={() => setShowReviewForm(app.id)}
                    className="w-full py-3 bg-theme-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Deja una valoración
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden w-full overflow-hidden mb-8"
              >
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterPanel 
              filters={filters} 
              onFilterChange={setFilters}
              onClose={() => {}}
            />
          </div>

          {/* Shop Grid */}
          <div className="flex-1">
            {filteredShops.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-theme-secondary/10">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-zinc-300" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2">No encontramos resultados</h3>
                <p className="text-zinc-500">Prueba ajustando tus filtros de búsqueda.</p>
                <button 
                  onClick={() => setFilters({ category: 'Todos', minRating: 0, maxPrice: 3, onlyAvailable: false })}
                  className="mt-8 text-theme-primary font-black uppercase tracking-widest text-sm"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredShops.map((shop, i) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelectShop(shop)}
                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-theme-secondary/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src={shop.photo} 
                        alt={shop.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <p className="text-white text-sm font-medium leading-relaxed italic line-clamp-2">{shop.description}</p>
                      </div>
                      <div className="absolute top-6 right-6 flex flex-col gap-2">
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black shadow-lg">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {shop.rating}
                        </div>
                        <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-0.5 text-xs font-black text-white shadow-lg self-end">
                          {[...Array(shop.priceRange)].map((_, i) => <DollarSign key={i} className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-zinc-100 rounded-full text-zinc-500">
                          {shop.type === 'barberia' ? 'Barberería' : 'Salón'}
                        </div>
                        {shop.categories.slice(0, 2).map(cat => (
                          <div key={cat} className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-theme-primary/10 rounded-full text-theme-primary">
                            {cat}
                          </div>
                        ))}
                      </div>
                      <h3 className="text-2xl font-black mb-2 tracking-tight text-theme-text">{shop.name}</h3>
                      <div className="flex items-center gap-2 text-theme-secondary text-sm mb-6 font-medium font-poppins">
                        <MapPin className="w-4 h-4 text-theme-primary" />
                        <span className="truncate">{shop.address}</span>
                      </div>
                      <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest pt-6 border-t border-theme-secondary/5 group-hover:text-theme-primary transition-colors">
                        <span>Ver disponibilidad</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6"
          >
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setSelectedShop(null);
                  setSelectedService(null);
                  setBookingDate(null);
                  setBookingTime('');
                }} 
                className="absolute top-8 right-8 p-4 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-4xl font-black tracking-tight">{selectedShop.name}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      startChat(selectedShop);
                    }}
                    className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl hover:bg-theme-primary hover:text-white transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                </div>
                <p className="text-zinc-500 font-medium">{selectedShop.address}</p>
              </div>

              {/* Works Carousel */}
              <div className="mb-10">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Nuestros Trabajos</h4>
                <WorkCarousel type={selectedShop.type} />
              </div>

              {!selectedService ? (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Selecciona un Servicio</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {services.map(service => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className="w-full flex items-center justify-between p-7 rounded-[2rem] bg-zinc-50 hover:bg-zinc-100 transition-all border-2 border-transparent hover:border-zinc-200 text-left group"
                        >
                          <div>
                            <div className="font-black text-xl mb-1 group-hover:text-theme-primary transition-colors">{service.name}</div>
                            <div className="text-zinc-400 text-sm font-bold flex items-center gap-2">
                              <Clock className="w-4 h-4" /> {service.duration} minutos
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-zinc-900">{formatCurrency(service.price)}</div>
                            <div className="text-[10px] font-black text-theme-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Reservar</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Reseñas de Clientes</h4>
                    <ReviewList shopId={selectedShop.id} />
                  </div>
                </div>
              ) : !bookingDate ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => setSelectedService(null)} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {selectedService.name}
                  </button>
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Selecciona fecha</h4>
                  <GoogleCalendar 
                    selectedDate={bookingDate}
                    onDateSelect={(date) => setBookingDate(date)}
                  />
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center justify-between">
                    <button onClick={() => setBookingDate(null)} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                      <Calendar className="w-4 h-4" /> {format(bookingDate, 'd MMMM', { locale: es })}
                    </button>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Resumen</p>
                      <p className="font-black text-lg">{selectedService.name}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Horarios Disponibles</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                        <button
                          key={time}
                          onClick={() => setBookingTime(time)}
                          className={cn(
                            "py-5 rounded-[1.5rem] font-black text-lg transition-all border-2",
                            bookingTime === time 
                              ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200 scale-105" 
                              : "bg-zinc-50 border-transparent hover:border-zinc-200"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={!bookingTime}
                      onClick={handleBooking}
                      className={cn(
                        "w-full text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 mt-8",
                        theme === 'feminine' ? 'bg-pink-500 shadow-pink-200' : theme === 'masculine' ? 'bg-zinc-900 shadow-zinc-200' : 'bg-theme-primary shadow-blue-200'
                      )}
                    >
                      Confirmar Cita • {formatCurrency(selectedService.price)}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg relative"
            >
              <button 
                onClick={() => setShowReviewForm(null)}
                className="absolute -top-4 -right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
              >
                <X className="w-5 h-5 text-zinc-900" />
              </button>
              <ReviewForm 
                shopId={appointments.find(a => a.id === showReviewForm)?.shopId || ''}
                clientId={auth.currentUser?.uid || ''}
                clientName={profile?.nombre || 'Cliente'}
                onSuccess={() => {
                  setShowReviewForm(null);
                  setNotification("¡Gracias por tu reseña! Ayudará a otros clientes.");
                  setTimeout(() => setNotification(null), 5000);
                  fetchShops(); // Refresh shops to see potential rating changes (if handled by server)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {bookingStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-6 right-6 z-[100] flex justify-center pointer-events-none"
          >
            <div className="bg-zinc-900 text-white px-10 py-6 rounded-[3rem] flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="bg-green-500 rounded-full p-3 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-xl leading-tight">¡Cita Confirmada!</p>
                <p className="text-zinc-400 font-medium">Te enviamos un recordatorio por SMS.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {activeChat && auth.currentUser && (
          <ChatWindow 
            chatId={activeChat.id}
            recipientName={activeChat.name}
            currentUserId={auth.currentUser.uid}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-zinc-100 px-10 py-6 sm:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex justify-between items-center z-40">
        <button 
          onClick={resetHome}
          className={cn("transition-all duration-300", theme === 'feminine' ? 'text-pink-500' : theme === 'masculine' ? 'text-zinc-900' : 'text-theme-primary')}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
        <button onClick={() => window.location.href = '/'} className="text-zinc-300 hover:text-zinc-900 transition-colors flex flex-col items-center">
          <ArrowLeft className="w-8 h-8" />
          <span className="text-[8px] font-black uppercase mt-1">Inicio</span>
        </button>
        <button className="text-zinc-300 hover:text-zinc-900 transition-colors"><Calendar className="w-8 h-8" /></button>
        <button className="text-zinc-300 hover:text-zinc-900 transition-colors"><User className="w-8 h-8" /></button>
      </nav>
    </div>
  );
}
