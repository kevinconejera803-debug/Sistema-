import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback, useMemo, memo, startTransition } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hls from 'hls.js';

gsap.registerPlugin(ScrollTrigger);

interface Module {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  lead?: string;
  theme?: string;
}

const MODULES: Module[] = [
  { slug: 'calendario', icon: '📅', title: 'Calendario', desc: 'Eventos y agenda personal', lead: 'Horario 24h: mes, semana y día', theme: 'red' },
  { slug: 'universidad', icon: '🎓', title: 'Universidad', desc: 'Tareas y entregas académicas', lead: 'Plan de estudios y vida académica', theme: 'gold' },
  { slug: 'contactos', icon: '👥', title: 'Contactos', desc: 'CRM personal', lead: 'Gestión de contactos', theme: 'purple' },
  { slug: 'mercados', icon: '��', title: 'Mercados', desc: 'Cotizaciones en tiempo real', lead: 'Futuros, forex, índices', theme: 'blue' },
  { slug: 'noticias', icon: '📰', title: 'Noticias', desc: 'RSS feeds internacionales', lead: 'Economía y mercados', theme: 'green' },
  { slug: 'asistente', icon: '🤖', title: 'Asistente IA', desc: 'Chat inteligente', lead: 'IA local con memoria', theme: 'cyan' },
];

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  course: string;
  due: string;
  completed: boolean;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
}

const globalState = {
  chatHistory: [] as { role: 'user' | 'bot'; content: string }[],
  videoReady: false,
  calendarEvents: [] as CalendarEvent[],
  tasks: [
    { id: 1, title: 'EntregaProyecto', course: 'Ing.Software', due: '2026-04-15', completed: false },
    { id: 2, title: 'ExamenFinal', course: 'Matemáticas', due: '2026-04-20', completed: false },
  ] as Task[],
  contacts: [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '+56912345678', company: 'TechCorp' },
    { id: 2, name: 'María García', email: 'maria@email.com', phone: '+56987654321', company: 'DataLabs' },
  ] as Contact[],
  marketsData: [
    { symbol: 'SPX', price: '5,234.18', change: '+0.45%' },
    { symbol: 'NDX', price: '18,432.90', change: '+0.72%' },
    { symbol: 'EUR/USD', price: '1.0842', change: '-0.12%' },
    { symbol: 'CL', price: '85.32', change: '+1.23%' },
  ],
  news: [
    { title: 'Fed mantiene tasas sin cambios', source: 'Bloomberg', time: 'hace 2h' },
    { title: 'Tech giants reportan ganancias', source: 'Reuters', time: 'hace 4h' },
    { title: 'Mercados asiáticos mixtos', source: 'CNBC', time: 'hace 6h' },
  ],
};

function initVideo() {
  if (!globalState.videoReady) {
    globalState.videoReady = true;
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
      }
    }
  }
}

const LoadingScreen = memo(function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [, setProgress] = useState(0);

  useEffect(() => {
    let start = performance.now();
    const duration = 600;
    function animate(now: number) {
      const elapsed = now - start;
      const prog = Math.min(100, (elapsed / duration) * 100);
      setProgress(Math.round(prog));
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      if (prog < 100) { requestAnimationFrame(animate); }
      else { setTimeout(onComplete, 100); }
    }
    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-counter font-display" ref={counterRef}>000</div>
      <div className="loading-bar"><div className="loading-bar-fill" ref={barRef}></div></div>
    </div>
  );
});

const GlobalNav = memo(function GlobalNav({ currentModule, onNavigate }: { currentModule: string | null; onNavigate: (slug: string | null) => void }) {
  return (
    <nav className={`nav ${currentModule ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate(null); }} className={`nav-link ${!currentModule ? 'active' : ''}`}>Home</a>
        {MODULES.slice(0, 5).map((mod) => (
          <a key={mod.slug} href="#" onClick={(e) => { e.preventDefault(); onNavigate(mod.slug); }} className={`nav-link ${currentModule === mod.slug ? 'active' : ''}`}>{mod.title}</a>
        ))}
        <a href="https://github.com/kevinconejera803-debug/Sistema-" className="nav-link" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </nav>
  );
});

const HeroSection = memo(function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 });
    }
  }, []);

  return (
    <section className="hero">
      <div className="hero-video">
        <video autoPlay muted loop playsInline>
          <source src="https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8" type="application/x-mpegURL" />
        </video>
      </div>
      <div className="hero-content fade-in" ref={contentRef}>
        <div className="hero-eyebrow">ASISTENTE PERSONAL · 2026</div>
        <h1 className="hero-title font-display">Tu Espacio</h1>
        <p className="hero-subtitle">Un <span className="role">asistente inteligente</span> para tu vida daily.</p>
        <p className="hero-description">Combina gestión personal con inteligencia artificial local. Sin APIs pagadas.</p>
      </div>
      <div className="scroll-indicator">SCROLL</div>
    </section>
  );
});

const ModulesGrid = memo(function ModulesGrid({ onSelect }: { onSelect: (slug: string) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, { y: 30, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: gridRef.current, start: 'top 85%' } });
    }
  }, []);

  return (
    <section className="section" id="modules">
      <div className="section-header">
        <h2 className="font-display">tus <i>módulos</i></h2>
        <p>Todo lo que necesitas para organizar tu vida.</p>
      </div>
      <div className="modules-grid" ref={gridRef}>
        {MODULES.map((mod) => (
          <button key={mod.slug} onClick={() => onSelect(mod.slug)} className="module-card">
            <div className="module-card-icon">{mod.icon}</div>
            <h3 className="module-card-title">{mod.title}</h3>
            <p className="module-card-desc">{mod.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
});

const CalendarioView = memo(function CalendarioView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i - today.getDate() + 1);
    return { date: d, day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">📅 Calendario</div>
        <div className="app-subtitle">{today.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</div>
      </div>
      <div className="calendar-grid">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        {days.slice(0, 35).map((d, i) => (
          <div key={i} className={`calendar-cell ${d.date.toDateString() === today.toDateString() ? 'today' : ''}`}>
            <span className="calendar-date">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const UniversidadView = memo(function UniversidadView() {
  const [tasks, setTasks] = useState(globalState.tasks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">🎓 Universidad</div>
        <div className="app-subtitle">Tareas y entregas</div>
      </div>
      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <label className="task-checkbox">
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
              <span className="task-title">{task.title}</span>
            </label>
            <div className="task-meta">
              <span className="task-course">{task.course}</span>
              <span className="task-due">📅 {task.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const ContactosView = memo(function ContactosView() {
  const [contacts] = useState(globalState.contacts);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">👥 Contactos</div>
        <div className="app-subtitle">CRM Personal</div>
      </div>
      <div className="search-box">
        <input type="text" placeholder="Buscar contactos..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <div className="contacts-list">
        {filtered.map(contact => (
          <div key={contact.id} className="contact-card">
            <div className="contact-avatar">{contact.name.charAt(0)}</div>
            <div className="contact-info">
              <div className="contact-name">{contact.name}</div>
              <div className="contact-email">{contact.email}</div>
              <div className="contact-company">{contact.company}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const MercadosView = memo(function MercadosView() {
  const [data] = useState(globalState.marketsData);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">📈 Mercados</div>
        <div className="app-subtitle">Cotizaciones en tiempo real</div>
      </div>
      <div className="markets-grid">
        {data.map(market => (
          <div key={market.symbol} className="market-card">
            <div className="market-symbol">{market.symbol}</div>
            <div className="market-price">{market.price}</div>
            <div className={`market-change ${market.change.startsWith('+') ? 'positive' : 'negative'}`}>{market.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

const NoticiasView = memo(function NoticiasView() {
  const [news] = useState(globalState.news);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
    }
  }, []);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">📰 Noticias</div>
        <div className="app-subtitle">Últimas noticias</div>
      </div>
      <div className="news-list">
        {news.map((item, i) => (
          <div key={i} className="news-item">
            <div className="news-title">{item.title}</div>
            <div className="news-meta">
              <span className="news-source">{item.source}</span>
              <span className="news-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AsistenteView = memo(function AsistenteView() {
  const chatInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    const input = chatInputRef.current;
    if (!input?.value.trim()) return;
    const msg = input.value.trim();
    globalState.chatHistory.push({ role: 'user', content: msg });
    input.value = '';
    const messagesEl = document.getElementById('chat-messages');
    if (messagesEl) {
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-message user';
      userMsg.innerHTML = `<div class="chat-bubble">${msg}</div>`;
      messagesEl.appendChild(userMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      setTimeout(() => {
        globalState.chatHistory.push({ role: 'bot', content: 'Entendido. ¿Hay algo más en lo que pueda ayudarte?' });
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        botMsg.innerHTML = '<span class="chat-avatar">🤖</span><div class="chat-bubble">Entendido. ¿Hay algo más en lo que pueda ayudarte?</div>';
        messagesEl.appendChild(botMsg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 500);
    }
  }, []);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-header">
        <div className="app-title">🤖 Asistente IA</div>
        <div className="app-subtitle">Tu asistente personal con IA</div>
      </div>
      <div className="chat-container">
        <div className="chat-messages" id="chat-messages">
          {globalState.chatHistory.length === 0 && (
            <div className="chat-message bot">
              <span className="chat-avatar">🤖</span>
              <div className="chat-bubble">Hola soy tu asistente IA. Estoy listo para ayudarte con tu calendario, tareas, contactos y más. ¿En qué puedo ayudarte hoy?</div>
            </div>
          )}
          {globalState.chatHistory.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === 'bot' && <span className="chat-avatar">🤖</span>}
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
        </div>
        <div className="chat-input-wrap">
          <input ref={chatInputRef} type="text" placeholder="Escribe tu mensaje..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
          <button onClick={handleSendMessage} className="chat-send">→</button>
        </div>
      </div>
    </div>
  );
});

const ModuleView = memo(function ModuleView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const mod = useMemo(() => MODULES.find(m => m.slug === slug), [slug]);

  useEffect(() => {
    gsap.fromTo(contentRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' });
  }, [slug]);

  if (!mod) {
    return (
      <section className="modulo-page">
        <div className="modulo-hero">
          <h1>Módulo no encontrado</h1>
          <button onClick={onBack} className="btn btn-primary">← Volver al Home</button>
        </div>
      </section>
    );
  }

  let ModuleComponent: any;
  if (slug === 'calendario') ModuleComponent = CalendarioView;
  else if (slug === 'universidad') ModuleComponent = UniversidadView;
  else if (slug === 'contactos') ModuleComponent = ContactosView;
  else if (slug === 'mercados') ModuleComponent = MercadosView;
  else if (slug === 'noticias') ModuleComponent = NoticiasView;
  else if (slug === 'asistente') ModuleComponent = AsistenteView;
  else ModuleComponent = () => {
    return (
      <div className="app-container">
        <div className="app-header">
          <div className="app-title">{mod.icon} {mod.title}</div>
          <div className="app-subtitle">{mod.desc}</div>
        </div>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Módulo en desarrollo</p>
      </div>
    );
  };

  return (
    <section className="module-full">
      <button onClick={onBack} className="back-button">← Volver</button>
      <ModuleComponent />
    </section>
  );
});

const Stats = memo(function Stats() {
  return (
    <section className="section stats-section">
      <div className="stats-grid">
        <div className="stat-item"><div className="stat-value">7</div><div className="stat-label">Módulos</div></div>
        <div className="stat-item"><div className="stat-value">∞</div><div className="stat-label">Conversaciones</div></div>
        <div className="stat-item"><div className="stat-value">0</div><div className="stat-label">Costo API</div></div>
      </div>
    </section>
  );
});

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <p>Tu Espacio — Asistente personal con IA local</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <a href="https://github.com/kevinconejera803-debug/Sistema-">GitHub</a> · 
        <a href="/asistente">Asistente</a> ·
        <a href="/calendario">Calendario</a>
      </p>
    </footer>
  );
});

function GlobalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  useEffect(() => {
    initVideo();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentModule]);

  const handleNavigate = useCallback((slug: string | null) => {
    startTransition(() => setCurrentModule(slug));
  }, []);

  const handleModuleSelect = useCallback((slug: string) => {
    startTransition(() => setCurrentModule(slug));
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <GlobalLayout>
      <GlobalNav currentModule={currentModule} onNavigate={handleNavigate} />
      {currentModule ? (
        <ModuleView slug={currentModule} onBack={() => handleNavigate(null)} />
      ) : (
        <>
          <HeroSection />
          <ModulesGrid onSelect={handleModuleSelect} />
          <Stats />
          <Footer />
        </>
      )}
    </GlobalLayout>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);