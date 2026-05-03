import { useState, useEffect, useRef, useCallback } from "react";

/* ── Canvas Particle System ── */
function ParticleCanvas({ active, burst }) {
  const ref = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);
  const heartId = useRef(0);

  const spawnParticle = useCallback((x, y, isBurst = false) => {
    const count = isBurst ? 30 : 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? 2 + Math.random() * 6 : 0.3 + Math.random() * 1.2;
      const colors = ["#ff80c0","#ffb3d9","#ff4090","#fff0f8","#ffd6ec","#ff6eb4","#c084fc","#f9a8d4"];
      particles.current.push({
        x: x ?? Math.random() * window.innerWidth,
        y: y ?? window.innerHeight + 10,
        vx: Math.cos(angle) * speed * (isBurst ? 1 : 0.2),
        vy: isBurst ? Math.sin(angle) * speed : -(0.6 + Math.random() * 1.4),
        size: isBurst ? 3 + Math.random() * 6 : 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: isBurst ? 0.012 + Math.random() * 0.02 : 0.005 + Math.random() * 0.008,
        shape: Math.random() > 0.5 ? "heart" : "circle",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }
  }, []);

  useEffect(() => {
    if (burst) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let i = 0; i < 5; i++) setTimeout(() => spawnParticle(cx + (Math.random()-0.5)*200, cy + (Math.random()-0.5)*200, true), i * 120);
    }
  }, [burst, spawnParticle]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      for (let i = 0; i < 3; i++) spawnParticle();
    }, 120);
    return () => clearInterval(interval);
  }, [active, spawnParticle]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const drawHeart = (ctx, x, y, size, rotation) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.5);
      ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
      ctx.fill(); ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      for (const p of particles.current) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.shape === "heart") drawHeart(ctx, p.x, p.y, p.size, p.rotation);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
        p.x += p.vx; p.y += p.vy; p.vy -= 0.01;
        p.life -= p.decay; p.rotation += p.rotSpeed;
      }
      ctx.globalAlpha = 1;
      raf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }} />;
}

/* ── Aurora Background ── */
function Aurora() {
  const blobs = [
    { color: "rgba(200,50,120,0.18)", dur: 14, delay: 0, w: "70%", h: "40%", top: "10%", left: "15%" },
    { color: "rgba(100,20,180,0.14)", dur: 18, delay: 3, w: "60%", h: "35%", top: "50%", left: "30%" },
    { color: "rgba(220,80,160,0.12)", dur: 22, delay: 7, w: "80%", h: "30%", top: "30%", left: "-10%" },
    { color: "rgba(60,0,120,0.2)", dur: 16, delay: 5, w: "50%", h: "50%", top: "5%", left: "50%" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 30%, #4a003a 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 50%, #08000f 0%, #0d0020 100%)" }} />
      {blobs.map((a, i) => (
        <div key={i} style={{
          position: "absolute", width: a.w, height: a.h, top: a.top, left: a.left,
          background: `radial-gradient(ellipse, ${a.color} 0%, transparent 70%)`,
          borderRadius: "50%", filter: "blur(40px)",
          animation: `auroraFloat ${a.dur}s ${a.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

/* ── Stars ── */
function Stars() {
  const stars = useRef(Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    s: 0.8 + Math.random() * 2.2, d: Math.random() * 5, dur: 2 + Math.random() * 4,
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: "50%", background: "#fff", opacity: 0.1,
          animation: `starPulse ${s.dur}s ${s.d}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Morphing SVG Heart ── */
function MorphHeart({ size = 120, pulse = false, glow = false }) {
  return (
    <div style={{
      width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: pulse ? "heartPump 0.85s ease-in-out infinite" : "none",
      filter: glow ? "drop-shadow(0 0 20px #ff4090) drop-shadow(0 0 50px #ff008888)" : "none",
    }}>
      <svg viewBox="0 0 100 90" width={size} height={size * 0.9}>
        <defs>
          <radialGradient id="hg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ff80c0" />
            <stop offset="60%" stopColor="#e8005a" />
            <stop offset="100%" stopColor="#8b0030" />
          </radialGradient>
        </defs>
        <path
          d="M50 85 C50 85 5 55 5 28 C5 12 17 2 30 2 C38 2 45 7 50 13 C55 7 62 2 70 2 C83 2 95 12 95 28 C95 55 50 85 50 85Z"
          fill="url(#hg)"
        />
        <path d="M30 12 C22 12 16 18 16 28 C16 35 20 42 26 48" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ── 3D Rotating Ring ── */
function Ring3D({ glow }) {
  return (
    <div style={{
      width: 120, height: 120, position: "relative",
      animation: "ring3d 4s linear infinite",
      filter: glow ? "drop-shadow(0 0 16px #ffd6ec) drop-shadow(0 0 40px #ff4090)" : "none",
      perspective: "400px",
    }}>
      <svg viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe0f0" />
            <stop offset="25%" stopColor="#ff80c0" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="75%" stopColor="#ff80c0" />
            <stop offset="100%" stopColor="#ffe0f0" />
          </linearGradient>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8edff" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f0ff" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="70" rx="48" ry="18" fill="rgba(0,0,0,0.3)" />
        <path d="M10 60 A50 20 0 0 1 110 60 A50 20 0 0 1 10 60" fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round" />
        <path d="M10 60 A50 20 0 0 0 110 60" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10" strokeLinecap="round" />
        <polygon points="60,5 66,20 80,20 69,29 73,44 60,35 47,44 51,29 40,20 54,20" fill="url(#dg)" opacity="0.95" />
        <polygon points="60,9 64,18 75,18 67,24 70,34 60,28 50,34 53,24 45,18 56,18" fill="rgba(200,240,255,0.5)" />
      </svg>
    </div>
  );
}

/* ── Liquid Ripple Button ── */
function LiquidBtn({ children, onClick, color = "#e8005a", size = "normal" }) {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    onClick && onClick(e);
  };
  return (
    <button onClick={handleClick} style={{
      position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      color: "#fff", border: "none",
      padding: size === "big" ? "18px 60px" : "14px 40px",
      borderRadius: 50, fontSize: size === "big" ? 22 : 18,
      fontFamily: "Georgia, serif", cursor: "pointer", letterSpacing: 0.5,
      boxShadow: `0 4px 24px ${color}66`,
      transition: "transform 0.15s, box-shadow 0.15s",
      animation: "pulseBtn 2.5s ease-in-out infinite",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {ripples.map(r => (
        <span key={r.id} style={{
          position: "absolute", left: r.x - 5, top: r.y - 5,
          width: 10, height: 10, borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          animation: "rippleOut 0.7s ease-out forwards",
          pointerEvents: "none",
        }} />
      ))}
      {children}
    </button>
  );
}

/* ── Typewriter ── */
function Typewriter({ text, speed = 45, onDone, color = "#fff" }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); onDone && onDone(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <span style={{ color }}>
      {displayed}
      {!done && <span style={{ animation: "blink 0.8s step-end infinite" }}> |</span>}
    </span>
  );
}

/* ── Confetti ── */
function ConfettiBurst() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: 30 + Math.random() * 40,
    color: ["#ff80c0","#ffd700","#c084fc","#34d399","#60a5fa","#f87171","#fff"][Math.floor(Math.random() * 7)],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.5,
    dur: 1.5 + Math.random() * 1.5,
    dx: (Math.random() - 0.5) * 300,
    rotate: Math.random() * 720,
    shape: Math.random() > 0.5,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "40%",
          width: p.size, height: p.size * (p.shape ? 0.4 : 1),
          borderRadius: p.shape ? 2 : "50%", background: p.color,
          animationName: "confettiFly",
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
          animationFillMode: "forwards",
          animationTimingFunction: "ease-out",
          "--dx": `${p.dx}px`, "--rot": `${p.rotate}deg`,
        }} />
      ))}
    </div>
  );
}

/* ── Petal Rain ── */
function PetalRain() {
  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: Math.random() * 100,
    delay: Math.random() * 6, dur: 5 + Math.random() * 6,
    size: 10 + Math.random() * 16, dx: (Math.random() - 0.5) * 80,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 4, overflow: "hidden" }}>
      {petals.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: -30, left: `${p.left}%`,
          animation: `petalFall ${p.dur}s ${p.delay}s linear infinite`,
          "--dx": `${p.dx}px`,
        }}>
          <svg viewBox="0 0 30 30" width={p.size} height={p.size}>
            <ellipse cx="15" cy="15" rx="12" ry="7" fill="#ff80c0" opacity="0.7" transform="rotate(30 15 15)" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ── Orbiting Dots ── */
function OrbitDots() {
  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 28px" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MorphHeart size={80} pulse />
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 12, height: 12, borderRadius: "50%",
          background: ["#ff80c0","#c084fc","#ffd6ec","#ff4090"][i],
          animation: `orbit ${3 + i}s ${i * 0.8}s linear infinite`,
          marginTop: -6, marginLeft: -6,
        }} />
      ))}
    </div>
  );
}

const storySlides = [
  { main: "रिया…", sub: "Three letters. One universe." },
  { main: "Every sunrise reminds me of you.", sub: "Warm. Golden. Impossible to ignore." },
  { main: "You make chaos feel like home.", sub: "Just by being you." },
  { main: "I've rehearsed this a thousand times.", sub: "But words keep failing me." },
  { main: "So I'll just say it plainly —", sub: "No poetry. Just my heart." },
];

/* ══════════ MAIN ══════════ */
export default function Proposal() {
  const [phase, setPhase] = useState("intro");
  const [slideIdx, setSlideIdx] = useState(0);
  const [vis, setVis] = useState(true);
  const [typeKey, setTypeKey] = useState(0);
  const [typeDone, setTypeDone] = useState(false);
  const [ringGlow, setRingGlow] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noStyle, setNoStyle] = useState({});
  const [burst, setBurst] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (phase === "final") setTimeout(() => setRingGlow(true), 1000);
  }, [phase]);

  const go = (toPhase, delay = 500) => {
    setVis(false);
    setTimeout(() => { setPhase(toPhase); setVis(true); }, delay);
  };

  const nextSlide = () => {
    setVis(false); setTypeDone(false);
    setTimeout(() => {
      if (slideIdx + 1 < storySlides.length) { setSlideIdx(i => i + 1); setTypeKey(k => k + 1); }
      else setPhase("final");
      setVis(true);
    }, 400);
  };

  const handleYes = () => {
    setBurst(true); setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
    go("yes", 200);
  };

  const handleNo = () => {
    setNoCount(c => c + 1);
    setNoStyle({ position: "absolute", left: `${10 + Math.random() * 55}%`, top: `${5 + Math.random() * 65}%` });
  };

  const noLabels = ["No","Nope 😅","Still no","Are you sure? 🥺","Please? 💕","One more try?","🙏"];
  const noLabel = noLabels[Math.min(noCount, noLabels.length - 1)];

  const PhaseWrap = ({ children }) => (
    <div style={{
      position: "relative", zIndex: 10, textAlign: "center",
      padding: "40px 28px", maxWidth: 560, margin: "0 auto",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) scale(1)" : "translateY(30px) scale(0.96)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>{children}</div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", background: "#05000d" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes auroraFloat { 0%{transform:translate(0,0) scale(1);opacity:.7} 100%{transform:translate(30px,20px) scale(1.15);opacity:1} }
        @keyframes starPulse { 0%,100%{opacity:.08;transform:scale(1)} 50%{opacity:.9;transform:scale(2)} }
        @keyframes heartPump { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 56%{transform:scale(1)} }
        @keyframes ring3d { 0%{transform:rotateY(0deg) rotateX(15deg)} 100%{transform:rotateY(360deg) rotateX(15deg)} }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(255,64,144,.4)} 70%{box-shadow:0 0 0 20px rgba(255,64,144,0)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(55px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(55px) rotate(-360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes rippleOut { to{transform:scale(30);opacity:0} }
        @keyframes pulseBtn { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes confettiFly { 0%{transform:translate(0,0) rotate(0);opacity:1} 100%{transform:translate(var(--dx),300px) rotate(var(--rot));opacity:0} }
        @keyframes petalFall { 0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:.8} 100%{transform:translateY(110vh) translateX(var(--dx)) rotate(360deg);opacity:.2} }
        @keyframes yesReveal { 0%{opacity:0;transform:scale(.5) rotate(-5deg)} 60%{transform:scale(1.08) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
        .shimmer-text {
          background: linear-gradient(90deg,#ff80c0,#fff,#ffd6ec,#fff,#ff80c0);
          background-size: 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <Aurora />
      <Stars />
      <PetalRain />
      <ParticleCanvas active={phase !== "intro"} burst={burst} />
      {confetti && <ConfettiBurst />}

      {/* INTRO */}
      {phase === "intro" && (
        <PhaseWrap>
          <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 24 }}>
            <MorphHeart size={110} pulse glow />
          </div>
          <h1 className="shimmer-text" style={{ fontSize: 50, margin: "0 0 10px", fontWeight: "normal", letterSpacing: 3, fontFamily: "Georgia, serif" }}>
            For Riya
          </h1>
          <p style={{ color: "#ffb3d9", fontSize: 17, lineHeight: 1.8, marginBottom: 10, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            A message so honest it scared me a little.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", margin: "20px 0 28px" }}>
            {["💗","✨","🌸","✨","💗"].map((e, i) => (
              <span key={i} style={{ fontSize: 22, animation: `sparkle ${1.5 + i * 0.3}s ${i * 0.2}s ease-in-out infinite` }}>{e}</span>
            ))}
          </div>
          <LiquidBtn onClick={() => go("story")} color="#c2006e">Open your heart ✨</LiquidBtn>
        </PhaseWrap>
      )}

      {/* STORY */}
      {phase === "story" && (
        <PhaseWrap>
          <OrbitDots />
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,130,190,0.2)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, backdropFilter: "blur(10px)" }}>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#ff80c0", textTransform: "uppercase", margin: "0 0 14px" }}>
              {slideIdx + 1} of {storySlides.length}
            </p>
            <p style={{ fontSize: 27, color: "#fff", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.5, minHeight: 80 }}>
              <Typewriter key={typeKey} text={`"${storySlides[slideIdx].main}"`} onDone={() => setTypeDone(true)} />
            </p>
            <p style={{ fontSize: 15, color: "#ffb3d9", margin: 0, opacity: typeDone ? 1 : 0, transition: "opacity 0.8s 0.3s", fontFamily: "Georgia, serif" }}>
              — {storySlides[slideIdx].sub}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {storySlides.map((_, i) => (
              <div key={i} style={{ height: 6, borderRadius: 3, width: i === slideIdx ? 32 : 8, background: i <= slideIdx ? "#ff4090" : "#3a1040", transition: "all 0.4s" }} />
            ))}
          </div>
          <LiquidBtn onClick={nextSlide} color="#b0005e">
            {slideIdx + 1 < storySlides.length ? "Continue →" : "I'm ready 💝"}
          </LiquidBtn>
        </PhaseWrap>
      )}

      {/* FINAL */}
      {phase === "final" && (
        <PhaseWrap>
          <div style={{ position: "relative", animation: "pulseRing 2s infinite", borderRadius: "50%", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <Ring3D glow={ringGlow} />
          </div>
          <h2 className="shimmer-text" style={{ fontSize: 38, fontWeight: "normal", margin: "0 0 16px", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>
            रिया, will you be<br />my forever?
          </h2>
          <div style={{ background: "rgba(255,64,144,0.07)", border: "1px solid rgba(255,64,144,0.2)", borderRadius: 16, padding: "20px 28px", marginBottom: 36 }}>
            <p style={{ fontSize: 16, color: "#ffcce4", lineHeight: 1.9, margin: 0, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              You are my calm in every storm,<br />
              my laughter in the quiet,<br />
              my home in every room.<br />
              <span style={{ color: "#ff80c0" }}>I choose you. Every single day.</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", position: "relative", minHeight: 120, alignItems: "center" }}>
            <LiquidBtn onClick={handleYes} color="#e8005a" size="big">Yes, always! 💍</LiquidBtn>
            <button
              onClick={handleNo}
              style={{
                ...noStyle,
                background: "transparent",
                border: "1px solid rgba(180,60,100,0.4)",
                color: "#9b5070",
                padding: "14px 32px", borderRadius: 50,
                fontSize: 16, fontFamily: "Georgia, serif",
                cursor: "pointer", transition: "all 0.12s",
              }}
            >{noLabel}</button>
          </div>
        </PhaseWrap>
      )}

      {/* YES */}
      {phase === "yes" && (
        <PhaseWrap>
          <div style={{ animation: "yesReveal 1s ease forwards", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
              {["💍","💗","💍"].map((e, i) => (
                <span key={i} style={{ fontSize: i === 1 ? 70 : 40, animation: `heartPump ${0.8 + i * 0.1}s ease-in-out infinite` }}>{e}</span>
              ))}
            </div>
            <h2 style={{
              margin: "0 0 10px", fontSize: 44, fontWeight: "normal", fontFamily: "Georgia, serif",
              background: "linear-gradient(90deg,#ff80c0,#fff,#ffd6ec,#fff,#ff80c0)", backgroundSize: "300%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 2s linear infinite",
              textShadow: "none",
            }}>She said YES! 🎉</h2>
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(255,64,144,0.12), rgba(100,0,60,0.1))", border: "1px solid rgba(255,128,192,0.25)", borderRadius: 20, padding: "28px 32px", margin: "16px 0 24px" }}>
            <p style={{ fontSize: 13, letterSpacing: 3, color: "#ff80c0", textTransform: "uppercase", margin: "0 0 16px", fontFamily: "Georgia, serif" }}>My promise to you</p>
            <p style={{ fontSize: 17, color: "#ffcce4", fontFamily: "Georgia, serif", lineHeight: 2, margin: "0 0 16px" }}>
              I promise to show up for you —<br />
              not just on the easy days,<br />
              but on the days when everything feels heavy.<br />
            </p>
            <p style={{ fontSize: 17, color: "#ffcce4", fontFamily: "Georgia, serif", lineHeight: 2, margin: "0 0 16px" }}>
              I promise to listen before I speak,<br />
              to hold your hand through every storm,<br />
              and to never stop making you feel seen.
            </p>
            <p style={{ fontSize: 17, color: "#ff90c8", fontFamily: "Georgia, serif", lineHeight: 2, margin: 0, fontStyle: "italic" }}>
              This is not a feeling that fades.<br />
              This is a choice I make — every single morning —<br />
              <span style={{ color: "#ffb3d9", fontWeight: "bold" }}>to love you on purpose. Forever.</span>
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, fontSize: 28, animation: "float 2s ease-in-out infinite" }}>
            {"💕❤️💗❤️💕".split("").map((c, i) => (
              <span key={i} style={{ animation: `heartPump ${0.8 + i * 0.15}s ${i * 0.1}s ease-in-out infinite` }}>{c}</span>
            ))}
          </div>
        </PhaseWrap>
      )}
    </div>
  );
}