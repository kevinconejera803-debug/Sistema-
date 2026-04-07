import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
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
}

const MODULES: Module[] = [
  { slug: 'calendario', icon: '📅', title: 'Calendario', desc: 'Eventos y agenda personal', lead: 'Horario 24h: mes, semana y día con eventos en SQLite.' },
  { slug: 'universidad', icon: '🎓', title: 'Universidad', desc: 'Tareas, entregas y fechas', lead: 'Plan de estudios y vida académica.' },
  { slug: 'contactos', icon: '👥', title: 'Contactos', desc: 'CRM personal', lead: 'Contacto en vivo, edición y toasts.' },
  { slug: 'mercados', icon: '📊', title: 'Mercados', desc: 'Cotizaciones en tiempo real', lead: 'Futuros, forex, índices y acciones.' },
  { slug: 'noticias', icon: '📰', title: 'Noticias', desc: 'RSS feeds internacionales', lead: 'Noticias de economía y mercados.' },
  { slug: 'asistente', icon: '🤖', title: 'Asistente IA', desc: 'Chat inteligente con contexto', lead: 'IA local con memoria y contexto.' },
];

const AppContext = createContext<{ currentModule: string | null, setCurrentModule: (s: string | null) => void }>({ currentModule: null, setCurrentModule: () => {} });

function useApp() {
  return useContext(AppContext);
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [, setProgress] = useState(0);

  useEffect(() => {
    let start = performance.now();
    const duration = 2500;
    
    function animate(now: number) {
      const elapsed = now - start;
      const prog = Math.min(100, (elapsed / duration) * 100);
      setProgress(Math.round(prog));
      
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      
      if (prog < 100) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 400);
      }
    }
    
    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-counter font-display" ref={counterRef}>000</div>
      <div className="loading-bar"><div className="loading-bar-fill" ref={barRef}></div></div>
    </div>
  );
}

function Navigation({ scrolled }: { scrolled: boolean }) {
  const { setCurrentModule } = useApp();

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <button onClick={() => setCurrentModule(null)} className="nav-link active">Home</button>
        <button onClick={() => setCurrentModule('calendario')} className="nav-link">Calendario</button>
        <button onClick={() => setCurrentModule('universidad')} className="nav-link">Universidad</button>
        <button onClick={() => setCurrentModule('contactos')} className="nav-link">Contactos</button>
        <button onClick={() => setCurrentModule('asistente')} className="nav-link">IA</button>
        <a href="https://github.com/kevinconejera803-debug/Sistema-" className="nav-link" target="_blank">GitHub ↗</a>
      </div>
    </nav>
  );
}

function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      });
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
        <p className="hero-subtitle">
          Un <span className="role">asistente inteligente</span> para tu vida daily.
        </p>
        <p className="hero-description">
          Combina gestión personal (calendario, estudios, finanzas) con inteligencia artificial local. 
          Sin APIs pagadas. Todo corre en tu computadora.
        </p>
      </div>
      <div className="scroll-indicator animate-bounce">SCROLL</div>
    </section>
  );
}

function ModulesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { setCurrentModule } = useApp();

  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, {
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
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
          <button key={mod.slug} onClick={() => setCurrentModule(mod.slug)} className="module-card">
            <div className="module-card-icon">{mod.icon}</div>
            <h3 className="module-card-title">{mod.title}</h3>
            <p className="module-card-desc">{mod.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ModulePage({ slug }: { slug: string }) {
  const { setCurrentModule } = useApp();
  const mod = MODULES.find(m => m.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, [slug]);

  if (!mod) {
    return (
      <section className="modulo-page">
        <div className="modulo-hero">
          <h1>Módulo no encontrado</h1>
          <button onClick={() => setCurrentModule(null)} className="btn btn-primary">Volver al Home</button>
        </div>
      </section>
    );
  }

  return (
    <section className="modulo-page">
      <nav className="nav scrolled">
        <div className="nav-inner">
          <button onClick={() => setCurrentModule(null)} className="nav-link">← Home</button>
          <button className="nav-link active">{mod.title}</button>
        </div>
      </nav>
      
      <div className="modulo-hero" ref={contentRef}>
        <div className="modulo-icon">{mod.icon}</div>
        <h1 className="modulo-title font-display">{mod.title}</h1>
        <p className="modulo-lead">{mod.lead}</p>
        
        <div className="modulo-content">
          {slug === 'asistente' ? (
            <div className="ai-chat">
              <div className="chat-messages" id="chat-messages">
                <div className="chat-message bot">
                  <span className="chat-avatar">🤖</span>
                  <div className="chat-bubble">Hola soy tu asistente IA. ¿En qué puedo ayudarte hoy?</div>
                </div>
              </div>
              <div className="chat-input-wrap">
                <input type="text" id="chat-input" className="chat-input" placeholder="Escribe tu mensaje..." />
                <button id="chat-send" className="chat-send">→</button>
              </div>
            </div>
          ) : (
            <div className="module-preview">
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Este módulo requiere datos. Puedes agregar eventos en el calendario, 
                tareas en universidad, contactos, etc.
              </p>
              <a href={`/${slug}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Abrir en modo avanzado →
              </a>
            </div>
          )}
        </div>
        
        <button onClick={() => setCurrentModule(null)} className="modulo-back">← Volver al Home</button>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section stats-section">
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">7</div>
          <div className="stat-label">Módulos</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">∞</div>
          <div className="stat-label">Conversaciones</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">0</div>
          <div className="stat-label">Costo API</div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
}

function App() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentModule]);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <AppContext.Provider value={{ currentModule, setCurrentModule }}>
      {currentModule ? (
        <ModulePage slug={currentModule} />
      ) : (
        <>
          <Navigation scrolled={scrolled} />
          <Hero />
          <ModulesGrid />
          <Stats />
          <Footer />
        </>
      )}
    </AppContext.Provider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

const video = document.querySelector('video');
if (video) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
  }
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.id === 'chat-send') {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const messages = document.getElementById('chat-messages');
    if (input.value.trim() && messages) {
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-message user';
      userMsg.innerHTML = `<div class="chat-bubble">${input.value}</div>`;
      messages.appendChild(userMsg);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    }
  }
});

document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    if (input && document.activeElement === input) {
      input.dispatchEvent(new Event('click'));
    }
  }
});