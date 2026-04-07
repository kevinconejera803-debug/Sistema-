import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback, memo, startTransition } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hls from 'hls.js';

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  { slug: 'calendario', icon: 'CAL', title: 'Calendario', desc: 'Eventos y agenda personal', color: 'red', accent: '#f87171' },
  { slug: 'universidad', icon: 'UNI', title: 'Universidad', desc: 'Tareas y entregas academicas', color: 'gold', accent: '#fbbf24' },
  { slug: 'contactos', icon: 'CTO', title: 'Contactos', desc: 'CRM personal', color: 'purple', accent: '#a78bfa' },
  { slug: 'mercados', icon: 'MKT', title: 'Mercados', desc: 'Cotizaciones en tiempo real', color: 'blue', accent: '#60a5fa' },
  { slug: 'noticias', icon: 'NOT', title: 'Noticias', desc: 'RSS feeds internacionales', color: 'green', accent: '#4ade80' },
  { slug: 'asistente', icon: 'IA', title: 'Asistente IA', desc: 'Chat inteligente', color: 'cyan', accent: '#22d3d1' },
  { slug: 'oraciones', icon: 'ORA', title: 'Oraciones', desc: 'Registro de oraciones y peticiones', color: 'teal', accent: '#14b8a6' },
];

const globalState = {
  chatHistory: [] as { role: 'user' | 'bot'; content: string }[],
  videoReady: false,
  events: [
    { id: 1, title: 'Reunión equipo', date: '2026-04-07', time: '10:00', color: '#f87171' },
    { id: 2, title: 'Entrega proyecto', date: '2026-04-15', time: '23:59', color: '#fbbf24' },
  ],
  tasks: [
    { id: 1, title: 'Entrega Proyecto Final', course: 'Ing. Software', due: '2026-04-15', completed: false, priority: 'high' },
    { id: 2, title: 'Examen Matemáticas', course: 'Matemáticas', due: '2026-04-20', completed: false, priority: 'medium' },
    { id: 3, title: 'Tarea Física', course: 'Física', due: '2026-04-10', completed: true, priority: 'low' },
  ],
  contacts: [
    { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '+56912345678', company: 'TechCorp' },
    { id: 2, name: 'María García', email: 'maria@email.com', phone: '+56987654321', company: 'DataLabs' },
    { id: 3, name: 'Carlos López', email: 'carlos@email.com', phone: '+56911223344', company: 'CloudSoft' },
  ],
  markets: [
    { symbol: 'SPX', name: 'S&P 500', price: '5,234.18', change: '+0.45%', positive: true },
    { symbol: 'NDX', name: 'Nasdaq', price: '18,432.90', change: '+0.72%', positive: true },
    { symbol: 'EUR/USD', name: 'Euro/Dólar', price: '1.0842', change: '-0.12%', positive: false },
    { symbol: 'CL', name: 'Cobre Chile', price: '85.32', change: '+1.23%', positive: true },
  ],
  news: [
    { title: 'Fed mantiene tasas sin cambios', source: 'Bloomberg', time: 'hace 2h' },
    { title: 'Tech giants reportan ganancias above expected', source: 'Reuters', time: 'hace 4h' },
    { title: 'Mercados asiáticos mixtos', source: 'CNBC', time: 'hace 6h' },
  ],
  prayers: [
    { id: 1, title: 'Por mi familia', description: 'Salud y unidad familiar', status: 'answered', date: '2026-03-15' },
    { id: 2, title: 'Por mi trabajo', description: 'Nuevas oportunidades', status: 'in_progress', date: '2026-04-01' },
    { id: 3, title: 'Por salud', description: 'Recuperación de mi abuelo', status: 'pending', date: '2026-04-06' },
  ],
};

function initVideo() {
  if (!globalState.videoReady) {
    globalState.videoReady = true;
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');
      hls.attachMedia(video);
    }
  }
}

const LoadingScreen = memo(function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [, setProgress] = useState(0);
  useEffect(() => {
    let start = performance.now();
    const animate = (now: number) => {
      const prog = Math.min(100, ((now - start) / 600) * 100);
      setProgress(Math.round(prog));
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      if (prog < 100) requestAnimationFrame(animate);
      else setTimeout(onComplete, 100);
    };
    requestAnimationFrame(animate);
  }, [onComplete]);
  return (<div className="loading-screen"><div className="loading-counter font-display" ref={counterRef}>000</div><div className="loading-bar"><div className="loading-bar-fill" ref={barRef}></div></div></div>);
});

const GlobalNav = memo(function GlobalNav({ currentModule, onNavigate }: { currentModule: string | null; onNavigate: (slug: string | null) => void }) {
  return (<nav className={`nav ${currentModule ? 'scrolled' : ''}`}><div className="nav-inner"><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(null); }} className={`nav-link ${!currentModule ? 'active' : ''}`}>Home</a>{MODULES.map(m => <a key={m.slug} href="#" onClick={(e) => { e.preventDefault(); onNavigate(m.slug); }} className={`nav-link ${currentModule === m.slug ? 'active' : ''}`}>{m.title}</a>)}</div></nav>);
});

const HeroSection = memo(function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (contentRef.current) gsap.from(contentRef.current.children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }); }, []);
  return (<section className="hero"><div className="hero-video"><video autoPlay muted loop playsInline><source src="https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8" type="application/x-mpegURL" /></video></div><div className="hero-content fade-in" ref={contentRef}><div className="hero-eyebrow">ASISTENTE PERSONAL · 2026</div><h1 className="hero-title font-display">Tu Espacio</h1><p className="hero-subtitle">Un <span className="role">asistente inteligente</span> para tu vida daily.</p><p className="hero-description">Combina gestión personal con inteligencia artificial local.</p></div><div className="scroll-indicator">SCROLL</div></section>);
});

const ModulesGrid = memo(function ModulesGrid({ onSelect }: { onSelect: (slug: string) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (gridRef.current) gsap.from(gridRef.current.children, { y: 30, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: gridRef.current, start: 'top 85%' } }); }, []);
  return (<section className="section" id="modules"><div className="section-header"><h2 className="font-display">tus <i>módulos</i></h2><p>Todo lo que necesitas para organizar tu vida.</p></div><div className="modules-grid" ref={gridRef}>{MODULES.map(m => <button key={m.slug} onClick={() => onSelect(m.slug)} className="module-card"><div className="module-card-icon">{m.icon}</div><h3 className="module-card-title">{m.title}</h3><p className="module-card-desc">{m.desc}</p></button>)}</div></section>);
});

const CalendarioView = memo(function CalendarioView() {
  const [selectedDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  const days = Array.from({ length: 35 }, (_, i) => { const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - selectedDate.getDate() + 1); return { date: d, day: d.getDate() }; });
  const monthLabel = selectedDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();
  return (<div className="mod-page" ref={containerRef}><div className="mod-toolbar"><span className="mod-toolbar__label">VISTA</span><button className="mod-btn mod-btn--active">MES</button><button className="mod-btn mod-btn--ghost">SEMANA</button><button className="mod-btn mod-btn--ghost">DIA</button><span className="mod-toolbar__label mod-toolbar__label--gap">NAVEGACION</span><button className="mod-btn mod-btn--ghost">ANTERIOR</button><button className="mod-btn mod-btn--ghost">HOY</button><button className="mod-btn mod-btn--ghost">SIGUIENTE</button></div><div className="mod-cal"><div className="mod-cal__main"><p className="mod-cal__kicker">Horario en hora local</p><span className="mod-cal__month-label">{monthLabel}</span></div><div className="mod-cal__grid-wrap"><div className="mod-cal__weekdays"><span>LUN</span><span>MAR</span><span>MIE</span><span>JUE</span><span>VIE</span><span>SAB</span><span>DOM</span></div><div className="mod-cal__cells">{days.map((d, i) => <div key={i} className="mod-cal__cell">{d.day}</div>)}</div></div></div></div>);
});

const UniversidadView = memo(function UniversidadView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState(globalState.tasks);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  const toggleTask = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  return (<div className="mod-page" ref={containerRef}><div className="mod-uni-hero"><h2>Acceso rápido</h2><p>Todo lo que necesitas del <strong>ámbito universitario</strong>.</p></div><div className="tasks-list">{tasks.map(task => (<div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}><label className="task-checkbox"><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} /><span className="task-title">{task.title}</span></label><div className="task-meta"><span className="task-course">{task.course}</span><span className="task-due">📅 {task.due}</span><span className={`priority priority-${task.priority}`}>{task.priority.toUpperCase()}</span></div></div>))}</div></div>);
});

const ContactosView = memo(function ContactosView() {
  const [contacts] = useState(globalState.contacts);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
  return (<div className="mod-page" ref={containerRef}><p className="mod-page__kicker">Agenda local: busca sin recargar.</p><div className="mod-toolbar"><input type="search" className="contact-filter" placeholder="Filtrar por nombre, email o empresa…" value={filter} onChange={(e) => setFilter(e.target.value)} /></div><div className="contacts-list">{filtered.map(contact => (<div key={contact.id} className="contact-card"><div className="contact-avatar">{contact.name.charAt(0)}</div><div className="contact-info"><div className="contact-name">{contact.name}</div><div className="contact-email">{contact.email}</div><div className="contact-company">{contact.company}</div></div></div>))}</div></div>);
});

const MercadosView = memo(function MercadosView() {
  const [data] = useState(globalState.markets);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  return (<div className="mod-page" ref={containerRef}><p className="mod-page__kicker">Precios de referencia en tiempo real.</p><div className="markets-grid">{data.map(m => (<div key={m.symbol} className="market-card"><div className="market-symbol">{m.symbol}</div><div className="market-name">{m.name}</div><div className="market-price">{m.price}</div><div className={`market-change ${m.positive ? 'positive' : 'negative'}`}>{m.change}</div></div>))}</div></div>);
});

const NoticiasView = memo(function NoticiasView() {
  const [news] = useState(globalState.news);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  return (<div className="mod-page" ref={containerRef}><p className="mod-page__kicker">Últimas noticias de fuentes verificables.</p><div className="news-list">{news.map((item, i) => (<div key={i} className="news-item"><div className="news-title">{item.title}</div><div className="news-meta"><span className="news-source">{item.source}</span><span className="news-time">{item.time}</span></div></div>))}</div></div>);
});

const AsistenteView = memo(function AsistenteView() {
  const chatInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.out' }); }, []);
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
  return (<div className="mod-page" ref={containerRef}><div className="chat-container"><div className="chat-messages" id="chat-messages">{globalState.chatHistory.length === 0 && (<div className="chat-message bot"><span className="chat-avatar">🤖</span><div className="chat-bubble">Hola soy tu asistente IA. Estoy listo para ayudarte con tu calendario, tareas, contactos y más. ¿En qué puedo ayudarte hoy?</div></div>)}</div><div className="chat-input-wrap"><input ref={chatInputRef} type="text" placeholder="Escribe tu mensaje..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} /><button onClick={handleSendMessage} className="chat-send">→</button></div></div></div>);
});

const OracionesView = memo(function OracionesView() {
  const [prayers] = useState(globalState.prayers);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (containerRef.current) gsap.from(containerRef.current.children, { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }); }, []);
  return (<div className="mod-page" ref={containerRef}><p className="mod-page__kicker">Registro de oraciones y peticiones.</p><div className="prayers-list">{prayers.map(prayer => (<div key={prayer.id} className={`prayer-item status-${prayer.status}`}><div className="prayer-title">{prayer.title}</div><div className="prayer-description">{prayer.description}</div><div className="prayer-meta"><span className={`prayer-status ${prayer.status}`}>{prayer.status === 'answered' ? '✓ Respondida' : prayer.status === 'in_progress' ? '⏳ En progreso' : '🙏 Pendiente'}</span><span className="prayer-date">📅 {prayer.date}</span></div></div>))}</div></div>);
});

const Stats = memo(function Stats() {
  return (<section className="section stats-section"><div className="stats-grid"><div className="stat-item"><div className="stat-value">7</div><div className="stat-label">Módulos</div></div><div className="stat-item"><div className="stat-value">∞</div><div className="stat-label">Conversaciones</div></div><div className="stat-item"><div className="stat-value">0</div><div className="stat-label">Costo API</div></div></div></section>);
});

const Footer = memo(function Footer() {
  return (<footer className="footer"><p>Tu Espacio — Asistente personal con IA local</p><p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}><a href="https://github.com/kevinconejera803-debug/Sistema-">GitHub</a> · <a href="/asistente">Asistente</a> · <a href="/calendario">Calendario</a></p></footer>);
});

function App() {
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  useEffect(() => { initVideo(); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [currentModule]);
  const handleNavigate = useCallback((slug: string | null) => { startTransition(() => setCurrentModule(slug)); }, []);
  const handleModuleSelect = useCallback((slug: string) => { startTransition(() => setCurrentModule(slug)); }, []);
  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;
  const mod = MODULES.find(m => m.slug === currentModule);
  let ModuleComponent: any = null;
  if (currentModule === 'calendario') ModuleComponent = CalendarioView;
  else if (currentModule === 'universidad') ModuleComponent = UniversidadView;
  else if (currentModule === 'contactos') ModuleComponent = ContactosView;
  else if (currentModule === 'mercados') ModuleComponent = MercadosView;
  else if (currentModule === 'noticias') ModuleComponent = NoticiasView;
  else if (currentModule === 'asistente') ModuleComponent = AsistenteView;
  else if (currentModule === 'oraciones') ModuleComponent = OracionesView;
  return (<><GlobalNav currentModule={currentModule} onNavigate={handleNavigate} />{currentModule && mod ? (<section className="module-full" style={{ '--accent': mod.accent } as React.CSSProperties}><button onClick={() => handleNavigate(null)} className="back-button">← Volver</button>{ModuleComponent && <ModuleComponent />}</section>) : (<><HeroSection /><ModulesGrid onSelect={handleModuleSelect} /><Stats /><Footer /></>)}</>);
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);