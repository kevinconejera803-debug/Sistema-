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
  const prevRef = useRef(location.pathname);

  useEffect(() => {
    if (containerRef.current && location.pathname !== prevRef.current) {
      gsap.fromTo(containerRef.current, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      prevRef.current = location.pathname;
    }
  }, [location.pathname]);

  return <div ref={containerRef}><Outlet /></div>;
}

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
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '12:00', color: '#ef4444' });

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
      setNewEvent({ title: '', date: '', time: '12:00', color: '#ef4444' });
      setShowForm(false);
      loadEvents();
    }
  };
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return { day: day > 0 && day <= daysInMonth ? day : '', current: day === currentDate.getDate() };
  });
  const monthLabel = currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const todayEvents = events.filter(e => e.start_iso?.startsWith(currentDate.toISOString().split('T')[0]));

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">CALENDARIO</h1>
        <p className="sys-module__kicker">Horario en hora local · evento o dia completo</p>
      </div>
      <div className="sys-toolbar">
        <button className={`sys-btn ${view === 'month' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setView('month')}>MES</button>
        <button className={`sys-btn ${view === 'week' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setView('week')}>SEMANA</button>
        <button className={`sys-btn ${view === 'day' ? 'sys-btn--primary' : 'sys-btn--ghost'}`} onClick={() => setView('day')}>DIA</button>
        <div className="sys-toolbar__spacer"></div>
        <button className="sys-btn sys-btn--ghost" onClick={prevMonth}>&lt; ANTERIOR</button>
        <button className="sys-btn sys-btn--ghost" onClick={() => setCurrentDate(new Date())}>HOY</button>
        <button className="sys-btn sys-btn--ghost" onClick={nextMonth}>SIGUIENTE &gt;</button>
        <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(!showForm)}>+ NUEVO</button>
      </div>
      {showForm && (
        <div className="sys-form">
          <div className="sys-form__head"><span className="sys-form__badge">Nuevo Evento</span></div>
          <div className="sys-form__row">
            <input type="text" placeholder="Titulo del evento *" className="sys-input" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
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
          <button className="sys-btn sys-btn--primary" onClick={handleAddEvent}>GUARDAR EVENTO</button>
        </div>
      )}
      <div className="sys-calendar">
        <div className="sys-calendar__header"><span>{monthLabel}</span></div>
        <div className="sys-calendar__weekdays">
          <span>LUN</span><span>MAR</span><span>MIE</span><span>JUE</span><span>VIE</span><span>SAB</span><span>DOM</span>
        </div>
        <div className="sys-calendar__grid">
          {days.map((d, i) => (
            <div key={i} className={`sys-calendar__cell ${d.current ? 'today' : ''} ${!d.day ? 'empty' : ''}`}>{d.day}</div>
          ))}
        </div>
      </div>
      <div className="sys-agenda">
        <h3>EVENTOS DE HOY ({todayEvents.length})</h3>
        <ul className="sys-agenda__list">
          {todayEvents.length === 0 && <li className="sys-agenda__empty">No hay eventos para hoy</li>}
          {todayEvents.map(e => (
            <li key={e.id} className="sys-agenda__item" style={{ borderLeftColor: e.color }}>
              <span className="sys-agenda__time">{e.start_iso?.split('T')[1]?.substring(0,5) || '00:00'}</span>
              <span className="sys-agenda__title">{e.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const UniversidadView = memo(function UniversidadView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', course: '', due_iso: '', priority: 'medium' });
  const [intranetUrl, setIntranetUrl] = useState('');
  const [aulaUrl, setAulaUrl] = useState('');

  useEffect(() => { loadTasks(); }, []);
  const loadTasks = async () => {
    const data = await fetchAPI('/assignments');
    setTasks(Array.isArray(data) ? data : []);
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

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">UNIVERSIDAD</h1>
        <p className="sys-module__kicker">Plan de estudios y vida academica</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--ghost" onClick={() => window.open(intranetUrl, '_blank')}>INTRANET</button>
        <button className="sys-btn sys-btn--ghost" onClick={() => window.open(aulaUrl, '_blank')}>AULA VIRTUAL</button>
        <div className="sys-toolbar__spacer"></div>
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
      <div className="sys-tasks">
        {tasks.length === 0 && <p className="sys-empty">No hay tareas. Agrega una nueva tarea.</p>}
        {tasks.map(task => (
          <div key={task.id} className={`sys-task ${task.completed ? 'completed' : ''}`}>
            <label className="sys-task__check">
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} />
              <span className="sys-task__title">{task.title}</span>
            </label>
            <div className="sys-task__meta">
              <span className="sys-task__course">{task.course}</span>
              <span className="sys-task__due">📅 {task.due_iso}</span>
              <span className={`sys-task__priority priority-${task.priority}`}>{task.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ContactosView = memo(function ContactosView() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', company: '' });

  useEffect(() => { loadContacts(); }, []);
  const loadContacts = async () => {
    const data = await fetchAPI('/contacts');
    setContacts(Array.isArray(data) ? data : []);
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
  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(filter.toLowerCase()) || c.email?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">CONTACTOS</h1>
        <p className="sys-module__kicker">Agenda local en SQLite: busca sin recargar.</p>
      </div>
      <div className="sys-toolbar">
        <input type="search" className="sys-search" placeholder="Buscar por nombre, email..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <span className="sys-search__count">{filtered.length} contactos</span>
        <div className="sys-toolbar__spacer"></div>
        <button className="sys-btn sys-btn--primary" onClick={() => setShowForm(!showForm)}>+ NUEVO</button>
      </div>
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
      <div className="sys-contacts">
        {filtered.map(c => (
          <div key={c.id} className="sys-contact">
            <div className="sys-contact__avatar">{c.name?.charAt(0) || '?'}</div>
            <div className="sys-contact__info">
              <div className="sys-contact__name">{c.name}</div>
              <div className="sys-contact__email">{c.email}</div>
              <div className="sys-contact__phone">{c.phone}</div>
              <div className="sys-contact__company">{c.company}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const MercadosView = memo(function MercadosView() {
  const [markets] = useState([
    { symbol: 'SPX', name: 'S&P 500', price: '5,234.18', change: '+0.45%', positive: true },
    { symbol: 'NDX', name: 'Nasdaq', price: '18,432.90', change: '+0.72%', positive: true },
    { symbol: 'EUR/USD', name: 'Euro/Dolar', price: '1.0842', change: '-0.12%', positive: false },
    { symbol: 'CL', name: 'Cobre Chile', price: '85.32', change: '+1.23%', positive: true },
  ]);
  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">MERCADOS</h1>
        <p className="sys-module__kicker">Precios de referencia.</p>
      </div>
      <div className="sys-markets">
        {markets.map(m => (
          <div key={m.symbol} className="sys-market">
            <div className="sys-market__symbol">{m.symbol}</div>
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
    { title: 'Fed mantiene tasas sin cambios', source: 'Bloomberg', time: 'hace 2h' },
    { title: 'Tech giants reportan ganancias', source: 'Reuters', time: 'hace 4h' },
    { title: 'Mercados asiaticos mixtos', source: 'CNBC', time: 'hace 6h' },
  ]);
  return (
    <div className="sys-module">
      <div className="sys-module__header">
        <h1 className="sys-module__title">NOTICIAS</h1>
        <p className="sys-module__kicker">Ultimas Noticias.</p>
      </div>
      <div className="sys-news">
        {news.map((n, i) => (
          <div key={i} className="sys-news__item">
            <div className="sys-news__title">{n.title}</div>
            <div className="sys-news__meta"><span>{n.source}</span><span>{n.time}</span></div>
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
  return <RouterProvider router={router} />;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);