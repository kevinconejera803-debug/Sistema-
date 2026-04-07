import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense } from 'react';
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

const globalState = {
  chatHistory: [] as { role: 'user' | 'bot'; content: string }[],
  videoReady: false,
  navRefs: new Map<string, HTMLButtonElement>(),
  preloadTimer: null as number | null,
};

function preloadModule(slug: string) {
  if (globalState.preloadTimer) clearTimeout(globalState.preloadTimer);
  globalState.preloadTimer = window.setTimeout(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/${slug}`;
    document.head.appendChild(link);
  }, 100);
}

function handleNavHover(slug: string) {
  preloadModule(slug);
}

const LoadingScreen = memo(function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [, setProgress] = useState(0);

  useEffect(() => {
    let start = performance.now();
    const duration = 800;
    
    function animate(now: number) {
      const elapsed = now - start;
      const prog = Math.min(100, (elapsed / duration) * 100);
      setProgress(Math.round(prog));
      
      if (barRef.current) barRef.current.style.width = prog + '%';
      if (counterRef.current) counterRef.current.textContent = String(Math.round(prog)).padStart(3, '0');
      
      if (prog < 100) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 100);
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
});

const Navigation = memo(function Navigation({ scrolled }: { scrolled: boolean }) {
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="/" className="nav-link active">Home</a>
        {MODULES.slice(0, 5).map((mod) => (
          <a 
            key={mod.slug}
            href={`/${mod.slug}`}
            onMouseEnter={() => handleNavHover(mod.slug)}
            className="nav-link"
          >
            {mod.title}
          </a>
        ))}
        <a href="https://github.com/kevinconejera803-debug/Sistema-" className="nav-link" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </nav>
  );
});

const Hero = memo(function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.1,
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
          Combina gestión personal con inteligencia artificial local. 
          Sin APIs pagadas. Todo corre en tu computadora.
        </p>
      </div>
      <div className="scroll-indicator animate-bounce">SCROLL</div>
    </section>
  );
});

const ModulesGrid = memo(function ModulesGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        },
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
          <a 
            key={mod.slug} 
            href={`/${mod.slug}`}
            onMouseEnter={() => handleNavHover(mod.slug)}
            className="module-card"
          >
            <div className="module-card-icon">{mod.icon}</div>
            <h3 className="module-card-title">{mod.title}</h3>
            <p className="module-card-desc">{mod.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
});

const ModulePage = memo(function ModulePage({ slug, onBack }: { slug: string; onBack: () => void }) {
  const mod = useMemo(() => MODULES.find(m => m.slug === slug), [slug]);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    gsap.fromTo(contentRef.current, 
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
    );
  }, [slug]);

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
      }, 300);
    }
  }, []);

  if (!mod) {
    return (
      <section className="modulo-page">
        <div className="modulo-hero">
          <h1>Módulo no encontrado</h1>
          <button onClick={onBack} className="btn btn-primary">Volver al Home</button>
        </div>
      </section>
    );
  }

  return (
    <section className="modulo-page">
      <nav className="nav scrolled">
        <div className="nav-inner">
          <button onClick={onBack} className="nav-link">← Home</button>
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
                {globalState.chatHistory.length === 0 && (
                  <div className="chat-message bot">
                    <span className="chat-avatar">🤖</span>
                    <div className="chat-bubble">Hola soy tu asistente IA. ¿En qué puedo ayudarte hoy?</div>
                  </div>
                )}
              </div>
              <div className="chat-input-wrap">
                <input 
                  ref={chatInputRef}
                  type="text" 
                  id="chat-input" 
                  className="chat-input" 
                  placeholder="Escribe tu mensaje..." 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="chat-send">→</button>
              </div>
            </div>
          ) : (
            <div className="module-preview">
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Gestiona tus {mod.desc.toLowerCase()}.
                <br /><br />
                Accede al modo completo para todas las funcionalidades.
              </p>
              <a href={`/${slug}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Abrir en modo avanzado →
              </a>
            </div>
          )}
        </div>
        
        <button onClick={onBack} className="modulo-back">← Volver al Home</button>
      </div>
    </section>
  );
});

const Stats = memo(function Stats() {
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

const PageLoader = memo(function PageLoader() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-muted)'
    }}>
      Cargando...
    </div>
  );
});

function App() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentModule]);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {!currentModule && <Navigation scrolled={scrolled} />}
      {currentModule ? (
        <ModulePage slug={currentModule} onBack={() => setCurrentModule(null)} />
      ) : (
        <>
          <Hero />
          <ModulesGrid />
          <Stats />
          <Footer />
        </>
      )}
    </Suspense>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

if (!globalState.videoReady) {
  globalState.videoReady = true;
  const video = document.querySelector('video');
  if (video) {
    if (Hls.isSupported()) {
      const hls = new Hls({ 
        enableWorker: true, 
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8');
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
    }
  }
}