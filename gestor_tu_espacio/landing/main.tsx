import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Hls from 'hls.js';

const MODULES = [
  { slug: '/calendario', icon: '📅', title: 'Calendario', desc: 'Eventos y agenda personal' },
  { slug: '/universidad', icon: '🎓', title: 'Universidad', desc: 'Tareas, entregas y fechas' },
  { slug: '/contactos', icon: '👥', title: 'Contactos', desc: 'CRM personal' },
  { slug: '/mercados', icon: '📊', title: 'Mercados', desc: 'Cotizaciones en tiempo real' },
  { slug: '/noticias', icon: '📰', title: 'Noticias', desc: 'RSS feeds internacionales' },
  { slug: '/asistente', icon: '🤖', title: 'Asistente IA', desc: 'Chat inteligente con contexto' },
];

const AI_FEATURES = [
  { icon: '🧠', title: 'Memoria', desc: 'Recuerda conversaciones' },
  { icon: '📅', title: 'Contexto', desc: 'Accede a tu calendario' },
  { icon: '⚡', title: 'Proactivo', desc: 'Sugiere acciones' },
  { icon: '🔒', title: 'Privado', desc: 'Datos locales only' },
];

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
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.nav');
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="nav-link active">Home</a>
        <a href="#modules" className="nav-link">Módulos</a>
        <a href="#ai" className="nav-link">IA</a>
        <a href="https://github.com/kevinconejera803-debug/Sistema-" className="nav-link" target="_blank">GitHub ↗</a>
      </div>
    </nav>
  );
}

function Hero() {
  const [role, setRole] = useState(0);
  const roles = ['asistente inteligente', 'gestor personal', 'organizador', 'asistente proactivo'];
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setRole((r) => (r + 1) % roles.length), 2500);
    
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
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-video">
        <video autoPlay muted loop playsInline>
          <source src="https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8" type="application/x-mpegURL" />
        </video>
      </div>
      <div className="hero-content fade-in" ref={contentRef}>
        <div className="hero-eyebrow">ASISTENTE PERSONAL · 2026</div>
        <h1 className="hero-title font-display">Tu Espacio</h1>
        <p className="hero-subtitle">
          Un <span className="role">{roles[role]}</span> para tu vida daily.
        </p>
        <p className="hero-description">
          Combina gestión personal (calendario, estudios, finanzas) con inteligencia artificial local. 
          Sin APIs pagadas, sin dependencias externalas. Todo corre en tu computadora.
        </p>
        <div className="hero-buttons">
          <a href="#modules" className="btn btn-primary">Explorar Módulos</a>
          <a href="/asistente" className="btn btn-outline">Hablar con IA →</a>
        </div>
      </div>
      <div className="scroll-indicator animate-bounce">SCROLL</div>
    </section>
  );
}

function Modules() {
  const gridRef = useRef<HTMLDivElement>(null);

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
          <a key={mod.slug} href={mod.slug} className="module-card">
            <div className="module-card-icon">{mod.icon}</div>
            <h3 className="module-card-title">{mod.title}</h3>
            <p className="module-card-desc">{mod.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

function AIFeatures() {
  return (
    <section className="section ai-section" id="ai">
      <div className="section-header">
        <h2 className="font-display">inteligencia <i>local</i></h2>
        <p>Sin costos de API. Todo corre en tu PC.</p>
      </div>
      <div className="ai-grid">
        {AI_FEATURES.map((feature) => (
          <div key={feature.title} className="ai-feature">
            <div className="ai-feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <Navigation scrolled={scrolled} />
      <Hero />
      <Modules />
      <AIFeatures />
      <Stats />
      <Footer />
    </>
  );
}

// Initialize
const root = createRoot(document.getElementById('root')!);
root.render(<App />);

// Initialize HLS video
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