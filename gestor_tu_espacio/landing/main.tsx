import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback, memo, createContext, useContext } from 'react';
import { createBrowserRouter, RouterProvider, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
import Hls from 'hls.js';

const API_BASE = '/api';

const MODULES = [
  { slug: 'calendario', icon: 'CAL', title: 'Calendario', desc: 'Eventos y agenda', color: 'red', accent: '#ef4444' },
  { slug: 'universidad', icon: 'UNI', title: 'Universidad', desc: 'Tareas y entregas', color: 'gold', accent: '#f59e0b' },
  { slug: 'contactos', icon: 'CTO', title: 'Contactos', desc: 'Agenda personal', color: 'purple', accent: '#8b5cf6' },
  { slug: 'mercados', icon: 'MKT', title: 'Mercados', desc: 'Cotizaciones', color: 'blue', accent: '#3b82f6' },
  { slug: 'noticias', icon: 'NOT', title: 'Noticias', desc: 'RSS feeds', color: 'green', accent: '#22c55e' },
  { slug: 'asistente', icon: 'IA', title: 'Asistente IA', desc: 'Chat inteligente', color: 'cyan', accent: '#06b6d4' },
  { slug: 'oraciones', icon: 'ORA', title: 'Oraciones', desc: 'Peticiones', color: 'teal', accent: '#14b8a6' },
];

const globalState = {
  events: [] as any[],
  tasks: [] as any[],
  contacts: [] as any[],
  markets: [] as any[],
  news: [] as any[],
  prayers: [] as any[],
  chatHistory: [] as { role: 'user' | 'bot'; content: string }[],
};

interface AppContextType {
  navigate: (slug: string) => void;
}

const AppContext = createContext<AppContextType>({ navigate: () => {} });

async function fetchAPI(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    return await res.json();
  } catch (e: unknown) { return []; }
}

async function postAPI(endpoint: string, data: any) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
});
    return await res.json();
  } catch (e: unknown) { return { error: (e as Error).message }; }
}

function initVideo() {
  const video = document.querySelector('video') as HTMLVideoElement;
  if (video && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');
    hls.attachMedia(video);
  }
}

const LoadingScreen = memo(function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [, setProgress] = useState(0);
  useEffect(() => {
    let start = performance.now();
    const animate = (now: number) => {
      const prog = Math.min(100, ((now - start) / 1000) * 100);
      setProgress(Math.round(prog));
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      if (prog < 100) requestAnimationFrame(animate);
      else setTimeout(onComplete, 300);
    };
    requestAnimationFrame(animate);
  }, [onComplete]);
  return (
    <div className="sys-loading">
      <div className="sys-loading__counter" ref={counterRef}>000</div>
      <div className="sys-loading__bar"><div className="sys-loading__bar-fill" ref={barRef}></div></div>
    </div>
  );
});

function AnimatedOutlet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  return <div ref={containerRef} className="sys-view"><Outlet /></div>;
}

const KeyboardHint = () => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const el = document.getElementById('keyboard-help');
        if (el) el.style.display = 'flex';
      }
      if (e.key === 'Escape') {
        const el = document.getElementById('keyboard-help');
        if (el) el.style.display = 'none';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  return (
    <div id="keyboard-help" className="sys-shortcuts-overlay" style={{ display: 'none' }} onClick={(e: any) => { if (e.target.id === 'keyboard-help') e.target.style.display = 'none'; }}>
      <div className="sys-shortcuts">
        <h3>Atajos de Teclado</h3>
        <div className="sys-shortcuts__grid">
          <div className="sys-shortcuts__item"><kbd>?</kbd><span>Mostrar ayuda</span></div>
          <div className="sys-shortcuts__item"><kbd>Esc</kbd><span>Cerrar</span></div>
        </div>
        <button className="sys-btn sys-btn--ghost" onClick={() => (document.getElementById('keyboard-help') as any).style.display = 'none'}>Cerrar</button>
      </div>
    </div>
  );
};

function GlobalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <AppContext.Provider value={{ navigate: (slug: string) => navigate(`/${slug}`) }}>
      <nav className="sys-nav">
        <div className="sys-nav__inner">
          <Link to="/" className={`sys-nav__link ${isHome ? 'active' : ''}`}>HOME</Link>
          {MODULES.map(m => (
            <Link key={m.slug} to={`/${m.slug}`} className={`sys-nav__link ${location.pathname === `/${m.slug}` ? 'active' : ''}`}>{m.title}</Link>
          ))}
        </div>
      </nav>
      <div className="sys-layout">
        <AnimatedOutlet />
      </div>
    </AppContext.Provider>
  );
}

function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
    }
  }, []);
  return (
    <section className="sys-hero">
      <div className="sys-hero__video">
        <video autoPlay muted loop playsInline>
          <source src="https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8" type="application/x-mpegURL" />
        </video>
        <div className="sys-hero__overlay"></div>
      </div>
      <div className="sys-hero__content" ref={contentRef}>
        <div className="sys-hero__eyebrow">ASISTENTE PERSONAL</div>
        <h1 className="sys-hero__title">Tu Espacio</h1>
        <p className="sys-hero__subtitle">Gestion personal con IA local</p>
        <p className="sys-hero__desc">Sin costos de API. Todo corre en tu computadora.</p>
      </div>
    </section>
  );
}

function ModulesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { navigate } = useContext(AppContext);
  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
    }
  }, []);
  return (
    <section className="sys-section">
      <div className="sys-section__header">
        <h2 className="sys-section__title">TUS MODULOS</h2>
        <p className="sys-section__subtitle">Todo lo que necesitas para organizar tu vida.</p>
      </div>
      <div className="sys-grid" ref={gridRef}>
        {MODULES.map(m => (
          <button key={m.slug} onClick={() => navigate(m.slug)} className="sys-card" style={{ '--card-accent': m.accent } as React.CSSProperties}>
            <div className="sys-card__icon">{m.icon}</div>
            <h3 className="sys-card__title">{m.title}</h3>
            <p className="sys-card__desc">{m.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <div className="sys-stats">
      <div className="sys-stat"><div className="sys-stat__value">7</div><div className="sys-stat__label">MODULOS</div></div>
      <div className="sys-stat"><div className="sys-stat__value">∞</div><div className="sys-stat__label">CONVERSACIONES</div></div>
      <div className="sys-stat"><div className="sys-stat__value">0</div><div className="sys-stat__label">COSTO API</div></div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="sys-footer">
      <p>Tu Espacio - Asistente personal con IA local</p>
      <div className="sys-footer__links">
        <a href="https://github.com/kevinconejera803-debug/Sistema-">GitHub</a>
        <span>|</span>
        <a href="/asistente">Asistente</a>
        <span>|</span>
        <a href="/calendario">Calendario</a>
      </div>
    </footer>
  );
}

function HomeView() {
  return (
    <>
      <Hero />
      <ModulesGrid />
      <Stats />
      <Footer />
    </>
  );
}

const CalendarioView = memo(function CalendarioView() {
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '12:00', color: '#38bdf8' });

  useEffect(() => { loadEvents(); }, []);
  const loadEvents = async () => {
    const data = await fetchAPI('/calendar/events');
    setEvents(Array.isArray(data) ? data : []);
  };
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    const start_iso = `${newEvent.date}T${newEvent.time}:00`;
    const result = await postAPI('/calendar/events', { title: newEvent.title, start_iso, end_iso: start_iso, color: newEvent.color });
    if (!result.error) {
      setNewEvent({ title: '', date: '', time: '12:00', color: '#38bdf8' });
      setShowForm(false);
      loadEvents();
    }
  };
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDays();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.start_iso?.startsWith(todayStr));
  const upcomingEvents = events.filter(e => e.start_iso >= new Date().toISOString()).sort((a, b) => a.start_iso.localeCompare(b.start_iso));
  const isToday = (d: Date) => d.toISOString().split('T')[0] === todayStr;
  const prevWeek = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
  const nextWeek = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
  const goToToday = () => setCurrentDate(new Date());
  const weekLabel = `${weekDays[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`.toUpperCase();
  const monthLabel = currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();
  
  const hourSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const weekDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const getEventsForHour = (day: Date, hour: string) => {
    const dayKey = day.toISOString().split('T')[0];
    return events.filter(e => e.start_iso?.startsWith(dayKey) && e.start_iso?.includes(hour));
  };

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">CALENDARIO</h1>
        <p className="sys-module__kicker">{monthLabel}</p>
      </div>
      
      <div className="sys-cal-nav">
        <button className="sys-cal-nav-btn" onClick={prevWeek}>◀</button>
        <div className="sys-cal-current">{weekLabel}</div>
        <button className="sys-cal-nav-btn" onClick={goToToday}>HOY</button>
        <button className="sys-cal-nav-btn" onClick={nextWeek}>▶</button>
      </div>

      <div className="sys-cal-tabs">
        <button className={`sys-cal-tab ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>
          <span className="sys-cal-tab-icon">📅</span> LÍNEA DE TIEMPO
        </button>
        <button className={`sys-cal-tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          <span className="sys-cal-tab-icon">📋</span> LISTADO
        </button>
        <button className="sys-btn sys-btn--primary sys-cal-add" onClick={() => setShowForm(!showForm)}>+ NUEVO</button>
      </div>

      {showForm && (
        <div className="sys-form">
          <div className="sys-form__head"><span className="sys-form__badge">Nuevo Evento</span></div>
          <div className="sys-form__row">
            <input type="text" placeholder="¿Qué tienes planificado?" className="sys-input" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
          </div>
          <div className="sys-form__row">
            <input type="date" className="sys-input" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            <input type="time" className="sys-input" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
            <select className="sys-input" value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}>
              <option value="#ef4444">Rojo</option>
              <option value="#f59e0b">Amarillo</option>
              <option value="#22c55e">Verde</option>
              <option value="#3b82f6">Azul</option>
              <option value="#8b5cf6">Morado</option>
            </select>
          </div>
          <button className="sys-btn sys-btn--primary" onClick={handleAddEvent}>CREAR EVENTO</button>
        </div>
      )}

      {view === 'timeline' ? (
        <div className="sys-cal-timeline">
          <div className="sys-cal-week">
            {weekDays.map((d, i) => (
              <div key={i} className={`sys-cal-day ${isToday(d) ? 'today' : ''}`}>
                <div className="sys-cal-day-header">
                  <span className="sys-cal-day-name">{weekDayNames[i]}</span>
                  <span className="sys-cal-day-num">{d.getDate()}</span>
                </div>
                <div className="sys-cal-hours">
                  {hourSlots.slice(0, 10).map(h => {
                    const evs = getEventsForHour(d, h);
                    return (
                      <div key={h} className="sys-cal-hour">
                        {evs.length > 0 ? evs.map((ev: any) => (
                          <div key={ev.id} className="sys-cal-event" style={{ borderLeftColor: ev.color }}>
                            <span className="sys-cal-event-time">{ev.start_iso?.split('T')[1]?.substring(0,5)}</span>
                            <span className="sys-cal-event-title">{ev.title}</span>
                          </div>
                        )) : <span className="sys-cal-hour-empty"></span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sys-cal-list">
          <div className="sys-cal-section">
            <div className="sys-cal-section-title">
              <span className="sys-cal-section-icon">⚡</span> HOY
              <span className="sys-cal-section-count">{todayEvents.length}</span>
            </div>
            {todayEvents.length === 0 ? (
              <div className="sys-cal-empty">Sin eventos programados para hoy</div>
            ) : (
              todayEvents.map((ev: any) => (
                <div key={ev.id} className="sys-cal-list-item" style={{ borderLeftColor: ev.color }}>
                  <div className="sys-cal-list-item-time">{ev.start_iso?.split('T')[1]?.substring(0,5) || '--:--'}</div>
                  <div className="sys-cal-list-item-content">
                    <div className="sys-cal-list-item-title">{ev.title}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="sys-cal-section">
            <div className="sys-cal-section-title">
              <span className="sys-cal-section-icon">📆</span> PRÓXIMOS
              <span className="sys-cal-section-count">{upcomingEvents.length}</span>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="sys-cal-empty">No hay eventos próximos</div>
            ) : (
              upcomingEvents.slice(0, 10).map((ev: any) => (
                <div key={ev.id} className="sys-cal-list-item" style={{ borderLeftColor: ev.color }}>
                  <div className="sys-cal-list-item-date">{ev.start_iso?.split('T')[0]}</div>
                  <div className="sys-cal-list-item-content">
                    <div className="sys-cal-list-item-title">{ev.title}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
)}
    </div>
  );
});

const UniversidadView = memo(function UniversidadView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sort] = useState<'due' | 'priority' | 'course'>('due');
  const [newTask, setNewTask] = useState({ title: '', course: '', due_iso: '', priority: 'medium' });
  const [intranetUrl, setIntranetUrl] = useState('');
  const [aulaUrl, setAulaUrl] = useState('');

  useEffect(() => { loadTasks(); }, []);
  const loadTasks = async () => {
    setLoading(true);
    const data = await fetchAPI('/assignments');
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  const handleAddTask = async () => {
    if (!newTask.title || !newTask.due_iso) return;
    const result = await postAPI('/assignments', newTask);
    if (!result.error) {
      setNewTask({ title: '', course: '', due_iso: '', priority: 'medium' });
      setShowForm(false);
      loadTasks();
    }
  };
  const toggleTask = async (id: number, completed: boolean) => {
    await postAPI(`/assignments/${id}`, { completed: !completed });
    loadTasks();
  };
  const deleteTask = async (id: number) => {
    if (confirm('¿Eliminar esta tarea?')) {
      await postAPI(`/assignments/${id}`, { delete: true });
      loadTasks();
    }
  };
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const filteredTasks = filter === 'all' ? tasks : filter === 'pending' ? pendingTasks : completedTasks;
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'due') return new Date(a.due_iso || '9999').getTime() - new Date(b.due_iso || '9999').getTime();
    if (sort === 'priority') return ['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority);
    return (a.course || '').localeCompare(b.course || '');
  });
  const isOverdue = (due_iso: string) => new Date(due_iso) < new Date() && new Date(due_iso).toDateString() !== new Date().toDateString();

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">UNIVERSIDAD</h1>
        <p className="sys-module__kicker">Gestor de tareas académicas · {pendingTasks.length} pendientes</p>
      </div>
      <div className="sys-kanban">
        <div className="sys-kanban-column">
          <div className="sys-kanban-header">
            <span>PENDIENTES</span>
            <span className="sys-kanban-count">{pendingTasks.length}</span>
          </div>
          <div className="sys-kanban-tasks">
            {pendingTasks.length === 0 && <div className="sys-kanban-empty">¡Sin tareas pendientes!</div>}
            {pendingTasks.map(task => (
              <div key={task.id} className={`sys-kanban-card ${isOverdue(task.due_iso) ? 'overdue' : ''}`}>
                <div className="sys-kanban-card-header">
                  <span className="sys-kanban-course">{task.course || 'General'}</span>
                  <span className={`sys-kanban-priority ${task.priority}`}>{task.priority}</span>
                </div>
                <div className="sys-kanban-title">{task.title}</div>
                <div className="sys-kanban-meta">
                  <span className={`sys-kanban-due ${isOverdue(task.due_iso) ? 'overdue' : ''}`}>📅 {task.due_iso}</span>
                </div>
                <div className="sys-kanban-actions">
                  <button onClick={() => toggleTask(task.id, task.completed)}>✓</button>
                  <button onClick={() => deleteTask(task.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sys-kanban-column done">
          <div className="sys-kanban-header">
            <span>COMPLETADAS</span>
            <span className="sys-kanban-count">{completedTasks.length}</span>
          </div>
          <div className="sys-kanban-tasks">
            {completedTasks.length === 0 && <div className="sys-kanban-empty">Sin completar</div>}
            {completedTasks.slice(0, 10).map(task => (
              <div key={task.id} className="sys-kanban-card completed">
                <div className="sys-kanban-title">{task.title}</div>
                <div className="sys-kanban-actions">
                  <button onClick={() => toggleTask(task.id, task.completed)}>↩</button>
                  <button onClick={() => deleteTask(task.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sys-progress-bar">
        <div className="sys-progress-bar__fill" style={{ width: `${progress}%` }}></div>
        <span className="sys-progress-bar__label">{progress}% completado</span>
      </div>
      <div className="sys-stats-row">
        <div className="sys-stat-badge"><span className="sys-stat-badge__value">{tasks.length}</span><span className="sys-stat-badge__label">Total</span></div>
        <div className="sys-stat-badge pending"><span className="sys-stat-badge__value">{pendingTasks.length}</span><span className="sys-stat-badge__label">Pendientes</span></div>
        <div className="sys-stat-badge done"><span className="sys-stat-badge__value">{completedTasks.length}</span><span className="sys-stat-badge__label">Completadas</span></div>
      </div>
      <div className="sys-toolbar">
        <button className={`sys-btn ${filter === 'all' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setFilter('all')}>TODAS</button>
        <button className={`sys-btn ${filter === 'pending' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setFilter('pending')}>PENDIENTES</button>
        <button className={`sys-btn ${filter === 'completed' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setFilter('completed')}>COMPLETADAS</button>
        <div className="sys-toolbar__spacer"></div>
        <button className="sys-btn sys-btn--ghost" onClick={() => window.open(intranetUrl, '_blank')}>INTRANET</button>
        <button className="sys-btn sys-btn--ghost" onClick={() => window.open(aulaUrl, '_blank')}>AULA VIRTUAL</button>
        <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(!showForm)}>+ NUEVA TAREA</button>
      </div>
      {showForm && (
        <div className="sys-form">
          <div className="sys-form__head"><span className="sys-form__badge">Nueva Tarea</span></div>
          <div className="sys-form__row">
            <input type="text" placeholder="Titulo *" className="sys-input" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
          </div>
          <div className="sys-form__row">
            <input type="text" placeholder="Curso/Materia" className="sys-input" value={newTask.course} onChange={(e) => setNewTask({ ...newTask, course: e.target.value })} />
            <input type="date" className="sys-input" value={newTask.due_iso} onChange={(e) => setNewTask({ ...newTask, due_iso: e.target.value })} />
            <select className="sys-input" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button className="sys-btn sys-btn--primary" onClick={handleAddTask}>GUARDAR TAREA</button>
        </div>
      )}
      <div className="sys-urls">
        <div className="sys-url-card">
          <h3>ENLACES INSTITUCIONALES</h3>
          <div className="sys-url-row">
            <input type="url" placeholder="URL Intranet (ej: https://intranet.uchile.cl)" className="sys-input" value={intranetUrl} onChange={(e) => setIntranetUrl(e.target.value)} />
            <button className="sys-btn sys-btn--ghost" onClick={() => intranetUrl && window.open(intranetUrl, '_blank')}>IR</button>
          </div>
          <div className="sys-url-row">
            <input type="url" placeholder="URL Aula Virtual (ej: https://aula.uchile.cl)" className="sys-input" value={aulaUrl} onChange={(e) => setAulaUrl(e.target.value)} />
            <button className="sys-btn sys-btn--ghost" onClick={() => aulaUrl && window.open(aulaUrl, '_blank')}>IR</button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="sys-loading-inline"><div className="sys-spinner"></div>Cargando tareas...</div>
      ) : sortedTasks.length === 0 ? (
        <div className="sys-empty">
          <div className="sys-empty__icon">📚</div>
          <p>{filter === 'completed' ? 'No hay tareas completadas' : filter === 'pending' ? '¡Excelente! No tienes tareas pendientes' : 'No hay tareas. Crea una nueva tarea.'}</p>
          {filter === 'all' && <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(true)}>CREAR TAREA</button>}
        </div>
      ) : (
        <div className="sys-tasks">
          {sortedTasks.map(task => (
            <div key={task.id} className={`sys-task ${task.completed ? 'completed' : ''} ${!task.completed && isOverdue(task.due_iso) ? 'overdue' : ''}`}>
              <label className="sys-task__check">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} />
                <span className="sys-task__title">{task.title}</span>
              </label>
              <div className="sys-task__meta">
                <span className="sys-task__course">{task.course}</span>
                <span className={`sys-task__due ${!task.completed && isOverdue(task.due_iso) ? 'overdue' : ''}`}>📅 {task.due_iso}</span>
                <span className={`sys-task__priority priority-${task.priority}`}>{task.priority}</span>
                <button className="sys-btn-icon delete" title="Eliminar" onClick={() => deleteTask(task.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const ContactosView = memo(function ContactosView() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [showForm, setShowForm] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', company: '' });

  useEffect(() => { loadContacts(); }, []);
  const loadContacts = async () => {
    setLoading(true);
    const data = await fetchAPI('/contacts');
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  const handleAddContact = async () => {
    if (!newContact.name) return;
    const result = await postAPI('/contacts', newContact);
    if (!result.error) {
      setNewContact({ name: '', email: '', phone: '', company: '' });
      setShowForm(false);
      loadContacts();
    }
  };
  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };
  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(filter.toLowerCase()) || c.email?.toLowerCase().includes(filter.toLowerCase()));
  const letterIndex = Array.from(new Set(contacts.map(c => c.name?.charAt(0).toUpperCase()).filter(Boolean))).sort();
  const favoriteContacts = contacts.filter(c => favorites.includes(c.id));
  
  const displayContacts = tab === 'favorites' ? favoriteContacts : (selectedLetter ? filtered.filter(c => c.name?.charAt(0).toUpperCase() === selectedLetter) : filtered);

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">CONTACTOS</h1>
        <p className="sys-module__kicker">{contacts.length} contactos · {favorites.length} favoritos</p>
      </div>
      <div className="sys-tabs">
        <button className={`sys-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>TODOS</button>
        <button className={`sys-tab ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}>⭐ FAVORITOS</button>
      </div>
      <div className="sys-toolbar">
        {tab === 'all' && <input type="search" className="sys-search" placeholder="Buscar por nombre, email..." value={filter} onChange={(e) => { setFilter(e.target.value); setSelectedLetter(null); }} />}
        <div className="sys-toolbar__spacer"></div>
        <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(!showForm)}>+ NUEVO</button>
      </div>
      {tab === 'all' && letterIndex.length > 0 && (
        <div className="sys-letter-index">
          <button className={`sys-letter ${!selectedLetter ? 'active' : ''}`} onClick={() => setSelectedLetter(null)}>TODO</button>
          {letterIndex.map(l => (
            <button key={l} className={`sys-letter ${selectedLetter === l ? 'active' : ''}`} onClick={() => setSelectedLetter(l)}>{l}</button>
          ))}
        </div>
      )}
      {showForm && (
        <div className="sys-form">
          <div className="sys-form__head"><span className="sys-form__badge">Nuevo Contacto</span></div>
          <div className="sys-form__row">
            <input type="text" placeholder="Nombre *" className="sys-input" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
          </div>
          <div className="sys-form__row">
            <input type="email" placeholder="Email" className="sys-input" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
            <input type="tel" placeholder="Telefono" className="sys-input" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
          </div>
          <div className="sys-form__row">
            <input type="text" placeholder="Empresa/Rol" className="sys-input" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
          </div>
          <button className="sys-btn sys-btn--primary" onClick={handleAddContact}>GUARDAR</button>
        </div>
      )}
      {loading ? (
        <div className="sys-loading-inline"><div className="sys-spinner"></div>Cargando contactos...</div>
      ) : displayContacts.length === 0 ? (
        <div className="sys-empty">
          <div className="sys-empty__icon">📇</div>
          <p>{tab === 'favorites' ? 'No tienes favoritos' : filter ? 'No se encontraron contactos' : 'No tienes contactos aún'}</p>
          {tab === 'all' && <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(true)}>AGREGAR CONTACTO</button>}
        </div>
      ) : (
        <div className="sys-contacts">
          {displayContacts.map(c => (
            <div key={c.id} className="sys-contact">
              <div className="sys-contact__avatar" style={{ background: `hsl(${c.name?.charCodeAt(0) * 10 % 360}, 60%, 40%)` }}>{c.name?.charAt(0) || '?'}</div>
              <div className="sys-contact__info">
                <div className="sys-contact__name">{c.name}</div>
                <div className="sys-contact__email">{c.email}</div>
                <div className="sys-contact__phone">{c.phone}</div>
                <div className="sys-contact__company">{c.company}</div>
              </div>
              <div className="sys-contact__actions">
                <button className={`sys-btn-icon star ${favorites.includes(c.id) ? 'active' : ''}`} onClick={() => toggleFavorite(c.id)}>{favorites.includes(c.id) ? '⭐' : '☆'}</button>
                {c.phone && <button className="sys-btn-icon" title="Llamar" onClick={() => window.location.href = `tel:${c.phone}`}>📞</button>}
                {c.email && <button className="sys-btn-icon" title="Email" onClick={() => window.location.href = `mailto:${c.email}`}>✉️</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const MercadosView = memo(function MercadosView() {
  const [markets] = useState([
    { symbol: 'SPX', name: 'S&P 500', price: '5,234.18', change: '+0.45%', positive: true, trend: 'up' },
    { symbol: 'NDX', name: 'Nasdaq', price: '18,432.90', change: '+0.72%', positive: true, trend: 'up' },
    { symbol: 'EUR/USD', name: 'Euro/Dolar', price: '1.0842', change: '-0.12%', positive: false, trend: 'down' },
    { symbol: 'CL', name: 'Cobre Chile', price: '85.32', change: '+1.23%', positive: true, trend: 'up' },
  ]);
  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">MERCADOS</h1>
        <p className="sys-module__kicker">Precios de referencia · Actualizado hace 5 min</p>
      </div>
      <div className="sys-markets">
        {markets.map(m => (
          <div key={m.symbol} className={`sys-market ${m.positive ? 'up' : 'down'}`}>
            <div className="sys-market__header">
              <span className="sys-market__symbol">{m.symbol}</span>
              <span className={`sys-market__trend ${m.trend}`}>{m.trend === 'up' ? '▲' : '▼'}</span>
            </div>
            <div className="sys-market__name">{m.name}</div>
            <div className="sys-market__price">{m.price}</div>
            <div className={`sys-market__change ${m.positive ? 'positive' : 'negative'}`}>{m.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

const NoticiasView = memo(function NoticiasView() {
  const [news] = useState([
    { id: 1, title: 'Fed mantiene tasas sin cambios en reunión de abril', source: 'Bloomberg', time: 'hace 2h', category: 'Economía', image: '📈' },
    { id: 2, title: 'Tech giants reportan ganancias trimestrales', source: 'Reuters', time: 'hace 4h', category: 'Tecnología', image: '💻' },
    { id: 3, title: 'Mercados asiáticos mixtos tras decisiones de bancos centrales', source: 'CNBC', time: 'hace 6h', category: 'Mercados', image: '🌏' },
    { id: 4, title: 'Nueva ley de startup friendly aprobada', source: 'El Mercurio', time: 'hace 8h', category: 'Negocios', image: '🚀' },
  ]);
  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">NOTICIAS</h1>
        <p className="sys-module__kicker">{news.length}headlines · Actualizado en tiempo real</p>
      </div>
      <div className="sys-news-grid">
        {news.map(n => (
          <div key={n.id} className="sys-news-card">
            <div className="sys-news-card-image">{n.image}</div>
            <div className="sys-news-card-content">
              <div className="sys-news-card-category">{n.category}</div>
              <div className="sys-news-card-title">{n.title}</div>
              <div className="sys-news-card-meta">
                <span className="sys-news-card-source">{n.source}</span>
                <span className="sys-news-card-time">{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AsistenteView = memo(function AsistenteView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useCallback(() => {
    const input = inputRef.current;
    if (!input?.value.trim()) return;
    const msg = input.value.trim();
    globalState.chatHistory.push({ role: 'user', content: msg });
    input.value = '';
    const el = document.getElementById('sys-chat-messages');
    if (el) {
      el.innerHTML += `<div class="sys-chat__msg user"><div class="sys-chat__bubble">${msg}</div></div>`;
      el.scrollTop = el.scrollHeight;
      setTimeout(() => {
        globalState.chatHistory.push({ role: 'bot', content: 'Entendido. Estoy aqui para ayudarte.' });
        el.innerHTML += `<div class="sys-chat__msg bot"><span class="sys-chat__avatar">IA</span><div class="sys-chat__bubble">Entendido. Estoy aqui para ayudarte.</div></div>`;
        el.scrollTop = el.scrollHeight;
      }, 500);
    }
  }, []);

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">ASISTENTE IA</h1>
        <p className="sys-module__kicker">Tu asistente personal.</p>
      </div>
      <div className="sys-chat">
        <div className="sys-chat__messages" id="sys-chat-messages">
          {globalState.chatHistory.length === 0 && (
            <div className="sys-chat__msg bot"><span className="sys-chat__avatar">IA</span><div className="sys-chat__bubble">Hola. Soy tu asistente IA. Como puedo ayudarte hoy?</div></div>
          )}
        </div>
        <div className="sys-chat__input-wrap">
          <input ref={inputRef} type="text" className="sys-chat__input" placeholder="Escribe tu mensaje..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <button onClick={sendMessage} className="sys-chat__send">ENVIAR</button>
        </div>
      </div>
    </div>
  );
});

const OracionesView = memo(function OracionesView() {
  const [prayers] = useState([
    { id: 1, title: 'Por mi familia', description: 'Salud y unidad', status: 'answered', date: '2026-03-15' },
    { id: 2, title: 'Por mi trabajo', description: 'Nuevas oportunidades', status: 'in_progress', date: '2026-04-01' },
    { id: 3, title: 'Por salud', description: 'Recuperacion', status: 'pending', date: '2026-04-06' },
  ]);
  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">ORACIONES</h1>
        <p className="sys-module__kicker">Registro de oraciones y peticiones.</p>
      </div>
      <div className="sys-prayers">
        {prayers.map(p => (
          <div key={p.id} className={`sys-prayer status-${p.status}`}>
            <div className="sys-prayer__title">{p.title}</div>
            <div className="sys-prayer__desc">{p.description}</div>
            <div className="sys-prayer__meta">
              <span className={`sys-prayer__status status-${p.status}`}>{p.status === 'answered' ? '✓ Respondida' : p.status === 'in_progress' ? '⏳ En progreso' : '🙏 Pendiente'}</span>
              <span className="sys-prayer__date">{p.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: 'calendario', element: <CalendarioView /> },
      { path: 'universidad', element: <UniversidadView /> },
      { path: 'contactos', element: <ContactosView /> },
      { path: 'mercados', element: <MercadosView /> },
      { path: 'noticias', element: <NoticiasView /> },
      { path: 'asistente', element: <AsistenteView /> },
      { path: 'oraciones', element: <OracionesView /> },
    ],
  },
]);

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { initVideo(); }, []);
  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;
  return <><KeyboardHint /><RouterProvider router={router} /></>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);