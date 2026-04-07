import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback, memo, startTransition, Fragment } from 'react';
import { gsap } from 'gsap';
import Hls from 'hls.js';

const MODULES = [
  { slug: 'calendario', icon: '📅', title: 'Calendario', desc: 'Eventos y agenda personal', color: 'red', accent: '#ef4444' },
  { slug: 'universidad', icon: '🎓', title: 'Universidad', desc: 'Tareas y entregas', color: 'gold', accent: '#f59e0b' },
  { slug: 'contactos', icon: '👥', title: 'Contactos', desc: 'Agenda personal', color: 'purple', accent: '#8b5cf6' },
  { slug: 'mercados', icon: '📊', title: 'Mercados', desc: 'Cotizaciones', color: 'blue', accent: '#3b82f6' },
  { slug: 'noticias', icon: '📰', title: 'Noticias', desc: 'RSS feeds', color: 'green', accent: '#22c55e' },
  { slug: 'asistente', icon: '🤖', title: 'Asistente IA', desc: 'Chat inteligente', color: 'cyan', accent: '#06b6d4' },
  { slug: 'oraciones', icon: '🙏', title: 'Oraciones', desc: 'Peticiones', color: 'teal', accent: '#14b8a6' },
];

const globalState = {
  events: [
    { id: 1, title: 'Reunion Equipo', date: '2026-04-07', time: '10:00', color: '#ef4444' },
    { id: 2, title: 'Entrega Proyecto', date: '2026-04-15', time: '23:59', color: '#f59e0b' },
  ],
  tasks: [
    { id: 1, title: 'Entrega Proyecto Final', course: 'Ing. Software', due: '2026-04-15', completed: false, priority: 'high' },
    { id: 2, title: 'Examen Matematicas', course: 'Matematicas', due: '2026-04-20', completed: false, priority: 'medium' },
    { id: 3, title: 'Tarea Fisica', course: 'Fisica', due: '2026-04-10', completed: true, priority: 'low' },
  ],
  contacts: [
    { id: 1, name: 'Juan Perez', email: 'juan@email.com', phone: '+56912345678', company: 'TechCorp' },
    { id: 2, name: 'Maria Garcia', email: 'maria@email.com', phone: '+56987654321', company: 'DataLabs' },
    { id: 3, name: 'Carlos Lopez', email: 'carlos@email.com', phone: '+56911223344', company: 'CloudSoft' },
  ],
  markets: [
    { symbol: 'SPX', name: 'S&P 500', price: '5,234.18', change: '+0.45%', positive: true },
    { symbol: 'NDX', name: 'Nasdaq', price: '18,432.90', change: '+0.72%', positive: true },
    { symbol: 'EUR/USD', name: 'Euro/Dolar', price: '1.0842', change: '-0.12%', positive: false },
    { symbol: 'CL', name: 'Cobre Chile', price: '85.32', change: '+1.23%', positive: true },
  ],
  news: [
    { title: 'Fed mantiene tasas sin cambios', source: 'Bloomberg', time: 'hace 2h' },
    { title: 'Tech giants reportan ganancias', source: 'Reuters', time: 'hace 4h' },
    { title: 'Mercados asiaticos mixtos', source: 'CNBC', time: 'hace 6h' },
  ],
  prayers: [
    { id: 1, title: 'Por mi familia', description: 'Salud y unidad', status: 'answered', date: '2026-03-15' },
    { id: 2, title: 'Por mi trabajo', description: 'Nuevas oportunidades', status: 'in_progress', date: '2026-04-01' },
    { id: 3, title: 'Por salud', description: 'Recuperacion', status: 'pending', date: '2026-04-06' },
  ],
  chatHistory: [] as { role: 'user' | 'bot'; content: string }[],
};

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
      const prog = Math.min(100, ((now - start) / 800) * 100);
      setProgress(Math.round(prog));
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      if (prog < 100) requestAnimationFrame(animate);
      else setTimeout(onComplete, 200);
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

const Navigation = memo(function Navigation({ currentModule, onNavigate }: { currentModule: string | null; onNavigate: (slug: string | null) => void }) {
  return (
    <nav className="sys-nav">
      <div className="sys-nav__inner">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(null); }} className={`sys-nav__link ${!currentModule ? 'active' : ''}`}>HOME</a>
        {MODULES.map(m => (
          <a key={m.slug} href="#" onClick={(e) => { e.preventDefault(); onNavigate(m.slug); }} className={`sys-nav__link ${currentModule === m.slug ? 'active' : ''}`}>{m.title}</a>
        ))}
      </div>
    </nav>
  );
});

const Hero = memo(function Hero() {
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
        <p className="sys-hero__subtitle"> Gestion personal con IA local</p>
        <p className="sys-hero__desc">Sin costos de API. Todo corre en tu computadora.</p>
      </div>
    </section>
  );
});

const ModulesGrid = memo(function ModulesGrid({ onSelect }: { onSelect: (slug: string) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } });
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
          <button key={m.slug} onClick={() => onSelect(m.slug)} className="sys-card" style={{ '--card-accent': m.accent } as React.CSSProperties}>
            <div className="sys-card__icon">{m.icon}</div>
            <h3 className="sys-card__title">{m.title}</h3>
            <p className="sys-card__desc">{m.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
});

const CalendarioView = memo(function CalendarioView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentDate] = useState(new Date());
  const [events] = useState(globalState.events);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return { day: day > 0 && day <= daysInMonth ? day : '', current: day === currentDate.getDate() };
  });
  const monthLabel = currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">CALENDARIO</h1>
        <p className="sys-module__kicker">Horario en hora local · formato 24 h</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--primary">MES</button>
        <button className="sys-btn sys-btn--ghost">SEMANA</button>
        <button className="sys-btn sys-btn--ghost">DIA</button>
        <div className="sys-toolbar__spacer"></div>
        <button className="sys-btn sys-btn--ghost">&larr; ANTERIOR</button>
        <button className="sys-btn sys-btn--ghost">HOY</button>
        <button className="sys-btn sys-btn--ghost">SIGUIENTE &rarr;</button>
      </div>
      <div className="sys-calendar">
        <div className="sys-calendar__header">
          <span>{monthLabel}</span>
        </div>
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
        <h3>AGENDA DEL DIA</h3>
        <ul className="sys-agenda__list">
          {events.map(e => (
            <li key={e.id} className="sys-agenda__item" style={{ borderLeftColor: e.color }}>
              <span className="sys-agenda__time">{e.time}</span>
              <span className="sys-agenda__title">{e.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const UniversidadView = memo(function UniversidadView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState(globalState.tasks);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  const toggleTask = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">UNIVERSIDAD</h1>
        <p className="sys-module__kicker">Plan de estudios y vida academica</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--ghost">VISTA TAREA</button>
        <button className="sys-btn sys-btn--ghost">VISTA CURSO</button>
        <button className="sys-btn sys-btn--ghost">CALENDARIO</button>
      </div>
      <div className="sys-tasks">
        {tasks.map(task => (
          <div key={task.id} className={`sys-task ${task.completed ? 'completed' : ''}`}>
            <label className="sys-task__check">
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
              <span className="sys-task__title">{task.title}</span>
            </label>
            <div className="sys-task__meta">
              <span className="sys-task__course">{task.course}</span>
              <span className="sys-task__due">📅 {task.due}</span>
              <span className={`sys-task__priority priority-${task.priority}`}>{task.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ContactosView = memo(function ContactosView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contacts] = useState(globalState.contacts);
  const [filter, setFilter] = useState('');
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.email.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">CONTACTOS</h1>
        <p className="sys-module__kicker">Agenda local en SQLite: busca sin recargar.</p>
      </div>
      <div className="sys-toolbar">
        <input type="search" className="sys-search" placeholder="Filtrar por nombre, email o empresa..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <span className="sys-search__count">{filtered.length} contactos</span>
      </div>
      <div className="sys-form">
        <div className="sys-form__head">
          <span className="sys-form__badge">Nuevo Contacto</span>
        </div>
        <div className="sys-form__row">
          <input type="text" placeholder="Nombre *" className="sys-input" />
        </div>
        <div className="sys-form__row">
          <input type="email" placeholder="Email" className="sys-input" />
          <input type="tel" placeholder="Telefono" className="sys-input" />
        </div>
        <div className="sys-form__row">
          <input type="text" placeholder="Empresa / Rol" className="sys-input" />
        </div>
        <button className="sys-btn sys-btn--primary">GUARDAR</button>
      </div>
      <div className="sys-contacts">
        {filtered.map(c => (
          <div key={c.id} className="sys-contact">
            <div className="sys-contact__avatar">{c.name.charAt(0)}</div>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [data] = useState(globalState.markets);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">MERCADOS</h1>
        <p className="sys-module__kicker">Precios de referencia en tiempo real.</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--ghost">FOREX</button>
        <button className="sys-btn sys-btn--ghost">FUTUROS</button>
        <button className="sys-btn sys-btn--ghost">ACCIONES</button>
        <button className="sys-btn sys-btn--primary">TODOS</button>
      </div>
      <div className="sys-markets">
        {data.map(m => (
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [news] = useState(globalState.news);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">NOTICIAS</h1>
        <p className="sys-module__kicker">Ultimas noticias de fuentes verificables.</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--ghost">ECONOMIA</button>
        <button className="sys-btn sys-btn--ghost">POLITICA</button>
        <button className="sys-btn sys-btn--ghost">INTERNACIONAL</button>
        <button className="sys-btn sys-btn--primary">TODOS</button>
      </div>
      <div className="sys-news">
        {news.map((n, i) => (
          <div key={i} className="sys-news__item">
            <div className="sys-news__title">{n.title}</div>
            <div className="sys-news__meta">
              <span>{n.source}</span>
              <span>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AsistenteView = memo(function AsistenteView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
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
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">ASISTENTE IA</h1>
        <p className="sys-module__kicker">Tu asistente personal con inteligencia artificial.</p>
      </div>
      <div className="sys-chat">
        <div className="sys-chat__messages" id="sys-chat-messages">
          {globalState.chatHistory.length === 0 && (
            <div className="sys-chat__msg bot">
              <span className="sys-chat__avatar">IA</span>
              <div className="sys-chat__bubble">Hola. Soy tu asistente IA. Estoy listo para ayudarte con tu calendario, tareas, contactos y mas. Que necesitas hoy?</div>
            </div>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [prayers] = useState(globalState.prayers);
  useEffect(() => {
    if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' });
  }, []);
  return (
    <div className="sys-module" ref={containerRef}>
      <div className="sys-module__header">
        <h1 className="sys-module__title">ORACIONES</h1>
        <p className="sys-module__kicker">Registro de oraciones y peticiones.</p>
      </div>
      <div className="sys-toolbar">
        <button className="sys-btn sys-btn--primary">NUEVA ORACION</button>
        <button className="sys-btn sys-btn--ghost">PENDIENTES</button>
        <button className="sys-btn sys-btn--ghost">EN PROGRESO</button>
        <button className="sys-btn sys-btn--ghost">RESPONDIDAS</button>
      </div>
      <div className="sys-prayers">
        {prayers.map(p => (
          <div key={p.id} className={`sys-prayer status-${p.status}`}>
            <div className="sys-prayer__title">{p.title}</div>
            <div className="sys-prayer__desc">{p.description}</div>
            <div className="sys-prayer__meta">
              <span className={`sys-prayer__status status-${p.status}`}>
                {p.status === 'answered' ? '✓ Respondida' : p.status === 'in_progress' ? '⏳ En progreso' : '🙏 Pendiente'}
              </span>
              <span className="sys-prayer__date">{p.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const Footer = memo(function Footer() {
  return (
    <footer className="sys-footer">
      <p>Tu Espacio — Asistente personal con IA local</p>
      <div className="sys-footer__links">
        <a href="https://github.com/kevinconejera803-debug/Sistema-">GitHub</a>
        <span>·</span>
        <a href="/asistente">Asistente</a>
        <span>·</span>
        <a href="/calendario">Calendario</a>
      </div>
    </footer>
  );
});

function App() {
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  useEffect(() => { initVideo(); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [currentModule]);
  const navigate = useCallback((slug: string | null) => startTransition(() => setCurrentModule(slug)), []);
  const select = useCallback((slug: string) => startTransition(() => setCurrentModule(slug)), []);
  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;
  let ModuleComponent: any = null;
  if (currentModule === 'calendario') ModuleComponent = CalendarioView;
  else if (currentModule === 'universidad') ModuleComponent = UniversidadView;
  else if (currentModule === 'contactos') ModuleComponent = ContactosView;
  else if (currentModule === 'mercados') ModuleComponent = MercadosView;
  else if (currentModule === 'noticias') ModuleComponent = NoticiasView;
  else if (currentModule === 'asistente') ModuleComponent = AsistenteView;
  else if (currentModule === 'oraciones') ModuleComponent = OracionesView;
  return (
    <Fragment>
      <Navigation currentModule={currentModule} onNavigate={navigate} />
      {currentModule && ModuleComponent ? (
        <div className="sys-module-page">
          <button onClick={() => navigate(null)} className="sys-back">&larr; VOLVER</button>
          <ModuleComponent />
        </div>
      ) : (
        <Fragment>
          <Hero />
          <ModulesGrid onSelect={select} />
          <div className="sys-stats">
            <div className="sys-stat"><div className="sys-stat__value">7</div><div className="sys-stat__label">MODULOS</div></div>
            <div className="sys-stat"><div className="sys-stat__value">∞</div><div className="sys-stat__label">CONVERSACIONES</div></div>
            <div className="sys-stat"><div className="sys-stat__value">0</div><div className="sys-stat__label">COSTO API</div></div>
          </div>
          <Footer />
        </Fragment>
      )}
    </Fragment>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);