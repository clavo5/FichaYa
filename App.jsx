import { useState, useEffect, useRef } from "react";
import {
  SYMBOLS, PAYTABLE, weightedRandom, spinReels,
  loginUsuario, getUsuarios, crearUsuario,
  actualizarFichas, registrarJugada,
  getRankingSemanal, getResumenZonas, getConfig,
} from "./lib/game";
import { obtenerUbicacion } from "./lib/geo";

const NIVEL_CONFIG = {
  Bronze: { color: "#cd7f32" },
  Plata: { color: "#C0C0C0" },
  Oro: { color: "#FFD700" },
  VIP: { color: "#FF6B6B" },
};

function NivelBadge({ nivel }) {
  const cfg = NIVEL_CONFIG[nivel] || NIVEL_CONFIG.Bronze;
  return (
    <span style={{
      background: cfg.color, color: nivel === "Plata" ? "#222" : "#fff",
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
      letterSpacing: 1, textTransform: "uppercase",
    }}>{nivel}</span>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onLogin, onAdminLogin }) {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("client");

  const handleLogin = async () => {
    setError("");
    if (mode === "admin") {
      // Admin: credenciales locales. Cámbialas por las tuyas.
      if (phone === "admin" && pass === "1234") onAdminLogin();
      else setError("Credenciales incorrectas");
      return;
    }
    setLoading(true);
    const { user, error } = await loginUsuario(phone, pass);
    setLoading(false);
    if (user) onLogin(user);
    else setError(error || "Error al iniciar sesión");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0d1117 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Trebuchet MS', sans-serif", padding: 20, position: "relative", overflow: "hidden",
    }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
          background: `hsl(${45 + i * 15}, 90%, 60%)`, borderRadius: "50%",
          top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.4,
          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes glow { 0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #FF6B6B} 50%{text-shadow:0 0 40px #FFD700,0 0 80px #FF6B6B} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes winPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes coinFall { 0%{transform:translateY(-100px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes notif { 0%{opacity:0;transform:translateX(100%)} 15%,85%{opacity:1;transform:translateX(0)} 100%{opacity:0;transform:translateX(100%)} }
        input::placeholder { color:#555 }
      `}</style>

      <div style={{ animation: "slideIn 0.6s ease", width: "100%", maxWidth: 380, zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎰</div>
          <h1 style={{
            fontSize: 48, fontWeight: 900, margin: 0,
            background: "linear-gradient(135deg, #FFD700, #FF6B6B, #FFD700)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "glow 2s ease infinite", letterSpacing: -1,
          }}>FichaYa</h1>
          <p style={{ color: "#888", fontSize: 14, margin: "4px 0 0", letterSpacing: 3, textTransform: "uppercase" }}>
            Tu suerte está aquí
          </p>
        </div>

        <div style={{
          display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12,
          padding: 4, marginBottom: 24, border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {["client", "admin"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
              background: mode === m ? "linear-gradient(135deg, #FFD700, #FF8C00)" : "transparent",
              color: mode === m ? "#000" : "#888", fontWeight: 700, fontSize: 13,
              cursor: "pointer", transition: "all 0.3s",
            }}>{m === "client" ? "🎮 Jugador" : "⚙️ Admin"}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#aaa", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block" }}>
              {mode === "client" ? "📱 Número de celular" : "👤 Usuario"}
            </label>
            <input value={phone} onChange={e => { setPhone(e.target.value); setError(""); }}
              placeholder={mode === "client" ? "3001234567" : "admin"}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,215,0,0.2)",
                color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box",
              }} />
          </div>
          <div>
            <label style={{ color: "#aaa", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block" }}>
              🔒 Contraseña
            </label>
            <input type="password" value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
              placeholder="••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,215,0,0.2)",
                color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box",
              }} />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#FF6B6B", fontSize: 13,
            }}>⚠️ {error}</div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            padding: "16px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
            color: "#000", fontSize: 17, fontWeight: 900, cursor: "pointer",
            letterSpacing: 1, marginTop: 4,
            animation: loading ? "none" : "pulse 2s ease infinite",
            boxShadow: "0 8px 30px rgba(255,215,0,0.3)", opacity: loading ? 0.6 : 1,
          }}>
            {loading ? "..." : mode === "client" ? "🎰 ENTRAR A JUGAR" : "🔐 ACCEDER"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SLOT MACHINE (conectado a Supabase)
// ============================================================
function SlotMachine({ user, setUser, onWin, config }) {
  const [reels, setReels] = useState(["🎰", "🎰", "🎰"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(5);
  const [coins, setCoins] = useState([]);
  const [spinCount, setSpinCount] = useState(0);
  const nearMiss = parseFloat(config.near_miss_rate || "0.3");

  const handleSpin = async () => {
    if (spinning || user.fichas < bet) return;
    setSpinning(true);
    setResult(null);
    setCoins([]);

    // Descontar apuesta (local + base de datos)
    setUser(u => ({ ...u, fichas: u.fichas - bet }));
    await actualizarFichas(user.id, -bet, "apuesta", "slots");

    let frame = 0;
    const interval = setInterval(async () => {
      setReels([weightedRandom(), weightedRandom(), weightedRandom()]);
      frame++;
      if (frame > 12) {
        clearInterval(interval);
        const outcome = spinReels(bet, nearMiss);
        setReels(outcome.reels);
        setSpinning(false);
        setSpinCount(s => s + 1);

        await registrarJugada(user.id, "slots", bet, outcome.reels.join(""), outcome.win);

        if (outcome.win > 0) {
          setResult({ win: outcome.win });
          setUser(u => ({ ...u, fichas: u.fichas + outcome.win }));
          await actualizarFichas(user.id, outcome.win, "premio", "slots");
          onWin(outcome.win);
          setCoins(Array.from({ length: 12 }, (_, i) => ({
            id: i, x: 20 + Math.random() * 60, delay: Math.random() * 0.5,
          })));
        } else {
          setResult({ win: 0 });
        }
      }
    }, 80);
  };

  const betOptions = [5, 10, 20, 50];

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Fichas</div>
          <div style={{ color: "#FFD700", fontSize: 28, fontWeight: 900 }}>🪙 {user.fichas}</div>
        </div>
        <NivelBadge nivel={user.nivel} />
      </div>

      <div style={{
        background: "linear-gradient(180deg, #1a0a2e 0%, #0d0d1a 100%)",
        border: "3px solid #FFD700", borderRadius: 24, padding: 20,
        boxShadow: "0 0 40px rgba(255,215,0,0.2), inset 0 0 40px rgba(0,0,0,0.5)",
        marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        {coins.map(c => (
          <div key={c.id} style={{
            position: "absolute", left: `${c.x}%`, top: 0, fontSize: 20,
            animation: "coinFall 1.5s ease-in forwards", animationDelay: `${c.delay}s`, zIndex: 10,
          }}>🪙</div>
        ))}

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {reels.map((symbol, i) => (
            <div key={i} style={{
              flex: 1, background: "rgba(0,0,0,0.5)",
              border: `2px solid ${spinning ? "#FF6B6B" : "rgba(255,215,0,0.3)"}`,
              borderRadius: 16, height: 90, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 44, transition: "border-color 0.2s",
              animation: spinning ? "float 0.1s ease infinite" : "none",
            }}>{symbol}</div>
          ))}
        </div>

        <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {result && !spinning && (
            <div style={{
              fontSize: result.win > 0 ? 20 : 14, fontWeight: 900,
              color: result.win > 0 ? "#FFD700" : "#666",
              animation: result.win > 0 ? "winPulse 0.5s ease 3" : "none", textAlign: "center",
            }}>
              {result.win > 0 ? `🎉 ¡GANASTE ${result.win} fichas!`
                : spinCount % 3 === 0 ? "😤 ¡Casi! Inténtalo de nuevo" : "💫 Sigue intentando..."}
            </div>
          )}
          {spinning && <div style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 700 }}>🎲 Girando...</div>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#888", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
          Apuesta (fichas)
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {betOptions.map(b => (
            <button key={b} onClick={() => setBet(b)} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: bet === b ? "linear-gradient(135deg, #FFD700, #FF8C00)" : "rgba(255,255,255,0.07)",
              color: bet === b ? "#000" : "#888", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>{b}</button>
          ))}
        </div>
      </div>

      <button onClick={handleSpin} disabled={spinning || user.fichas < bet} style={{
        width: "100%", padding: "18px", borderRadius: 16, border: "none",
        background: spinning || user.fichas < bet ? "rgba(255,255,255,0.05)"
          : "linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)",
        color: spinning || user.fichas < bet ? "#444" : "#000",
        fontSize: 20, fontWeight: 900, cursor: spinning || user.fichas < bet ? "not-allowed" : "pointer",
        letterSpacing: 2, boxShadow: spinning ? "none" : "0 8px 30px rgba(255,215,0,0.4)",
        animation: !spinning && user.fichas >= bet ? "pulse 2s ease infinite" : "none",
      }}>
        {spinning ? "🎲 GIRANDO..." : user.fichas < bet ? "❌ FICHAS INSUFICIENTES" : "🎰 ¡GIRAR!"}
      </button>

      <div style={{
        marginTop: 20, background: "rgba(255,255,255,0.03)", borderRadius: 14,
        padding: "14px 16px", border: "1px solid rgba(255,215,0,0.1)",
      }}>
        <div style={{ color: "#FFD700", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          💰 Tabla de premios
        </div>
        {Object.entries(PAYTABLE).map(([combo, mult]) => (
          <div key={combo} style={{
            display: "flex", justifyContent: "space-between", padding: "4px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 16 }}>{combo}</span>
            <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 700 }}>x{mult}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// RANKING (desde la vista SQL)
// ============================================================
function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankingSemanal().then(({ data }) => { setRanking(data); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: "20px 16px" }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 4, fontSize: 20 }}>🏆 Ranking Semanal</h2>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>Los más ganadores de La Guajira</p>
      {loading ? <p style={{ color: "#666" }}>Cargando...</p> :
        ranking.map((u, i) => (
          <div key={u.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: i === 0 ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 14, padding: "14px 16px", marginBottom: 10,
          }}>
            <div style={{
              width: 36, height: 36,
              background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.1)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: i < 3 ? "#000" : "#888", flexShrink: 0,
            }}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{u.nombre}</div>
              <div style={{ color: "#888", fontSize: 12 }}>{u.zona}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 14 }}>🪙 {u.ganado_semana}</div>
              <NivelBadge nivel={u.nivel} />
            </div>
          </div>
        ))}
    </div>
  );
}

// ============================================================
// CLIENT APP
// ============================================================
function ClientApp({ user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState("slots");
  const [notifications, setNotifications] = useState([]);
  const [config, setConfig] = useState({});

  useEffect(() => { getConfig().then(setConfig); }, []);

  const addNotification = (msg) => {
    const id = Date.now();
    setNotifications(n => [...n, { id, msg }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 3000);
  };
  const handleWin = (amount) => addNotification(`🎉 ¡Ganaste ${amount} fichas!`);

  const tabs = [
    { id: "slots", icon: "🎰", label: "Slots" },
    { id: "ranking", icon: "🏆", label: "Ranking" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d0d 100%)",
      fontFamily: "'Trebuchet MS', sans-serif", color: "#fff", maxWidth: 440, margin: "0 auto", position: "relative",
    }}>
      <div style={{ position: "fixed", top: 20, right: 16, zIndex: 999, display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: "linear-gradient(135deg, #FFD700, #FF8C00)", color: "#000",
            padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 20px rgba(255,215,0,0.4)", animation: "notif 3s ease forwards",
          }}>{n.msg}</div>
        ))}
      </div>

      <div style={{
        background: "linear-gradient(135deg, #1a0a2e, #0d1117)", padding: "16px 20px",
        borderBottom: "1px solid rgba(255,215,0,0.15)", display: "flex",
        justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{
            fontSize: 22, fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>🎰 FichaYa</div>
          <div style={{ color: "#888", fontSize: 12 }}>{user.nombre}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#FFD700", fontWeight: 900 }}>🪙 {user.fichas}</div>
            <NivelBadge nivel={user.nivel} />
          </div>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#888", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12,
          }}>Salir</button>
        </div>
      </div>

      <div style={{ paddingBottom: 80 }}>
        {tab === "slots" && <SlotMachine user={user} setUser={setUser} onWin={handleWin} config={config} />}
        {tab === "ranking" && <Ranking />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 440, background: "rgba(10,10,26,0.95)",
        borderTop: "1px solid rgba(255,215,0,0.15)", display: "flex", padding: "8px 0",
        backdropFilter: "blur(20px)",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, border: "none", background: "transparent",
            color: tab === t.id ? "#FFD700" : "#555", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, padding: "8px 0", cursor: "pointer",
          }}>
            <span style={{ fontSize: 22, filter: tab === t.id ? "drop-shadow(0 0 8px #FFD700)" : "none" }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN PANEL (conectado a Supabase)
// ============================================================
function GeoMap({ zonas }) {
  const canvasRef = useRef(null);
  const LAT_MIN = 10.8, LAT_MAX = 12.5, LNG_MIN = -73.2, LNG_MAX = -71.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0a1a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,215,0,0.05)"; ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let j = 0; j < H; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }

    zonas.forEach(z => {
      if (z.lat_centro == null) return;
      const x = ((z.lng_centro - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
      const y = H - ((z.lat_centro - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H;
      const count = z.total_clientes;
      const radius = 15 + count * 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
      g.addColorStop(0, "rgba(255,215,0,0.3)"); g.addColorStop(1, "rgba(255,215,0,0)");
      ctx.beginPath(); ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = count > 2 ? "rgba(255,107,107,0.8)" : "rgba(255,215,0,0.8)"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#000"; ctx.font = `bold ${12 + count}px Trebuchet MS`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(count, x, y);
      ctx.fillStyle = "#FFD700"; ctx.font = "bold 11px Trebuchet MS"; ctx.fillText(z.zona, x, y + radius + 14);
    });
  }, [zonas]);

  return <canvas ref={canvasRef} width={380} height={280}
    style={{ width: "100%", borderRadius: 16, border: "1px solid rgba(255,215,0,0.2)", display: "block" }} />;
}

function AdminPanel({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const [u, z] = await Promise.all([getUsuarios(), getResumenZonas()]);
    setUsers(u.data); setZonas(z.data); setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const totalFichas = users.reduce((s, u) => s + u.fichas, 0);
  const vipCount = users.filter(u => u.nivel === "VIP").length;

  const handleAddFichas = async (userId, amount) => {
    await actualizarFichas(userId, amount, "recarga");
    cargar();
  };

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Panel" },
    { id: "geo", icon: "🗺️", label: "Mapa" },
    { id: "users", icon: "👥", label: "Clientes" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a1a", fontFamily: "'Trebuchet MS', sans-serif",
      color: "#fff", maxWidth: 440, margin: "0 auto",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a0a2e, #0d1117)", padding: "16px 20px",
        borderBottom: "1px solid rgba(255,215,0,0.15)", display: "flex",
        justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>⚙️ FichaYa Admin</div>
          <div style={{ color: "#888", fontSize: 11 }}>Panel de control</div>
        </div>
        <button onClick={onLogout} style={{
          background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
          color: "#FF6B6B", padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
        }}>Salir</button>
      </div>

      <div style={{ paddingBottom: 80 }}>
        {loading && <p style={{ color: "#666", textAlign: "center", padding: 40 }}>Cargando datos...</p>}

        {!loading && tab === "dashboard" && (
          <div style={{ padding: "20px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Clientes", value: users.length, icon: "👥", color: "#4ECDC4" },
                { label: "Fichas en juego", value: totalFichas, icon: "🪙", color: "#FFD700" },
                { label: "VIP", value: vipCount, icon: "👑", color: "#FF6B6B" },
                { label: "Zonas activas", value: zonas.length, icon: "📍", color: "#95E06C" },
              ].map((kpi, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${kpi.color}22`,
                  borderRadius: 16, padding: "16px",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{kpi.icon}</div>
                  <div style={{ color: kpi.color, fontSize: 24, fontWeight: 900 }}>{kpi.value}</div>
                  <div style={{ color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "geo" && (
          <div style={{ padding: "20px 16px" }}>
            <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 4, fontSize: 18 }}>🗺️ Mapa de Clientes</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>Zonas calientes = más clientes = más premios</p>
            <GeoMap zonas={zonas} />
            <div style={{ marginTop: 20 }}>
              {zonas.map(z => (
                <div key={z.zona} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${z.total_clientes > 2 ? "rgba(255,107,107,0.3)" : "rgba(255,215,0,0.1)"}`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 10,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                      {z.total_clientes > 2 ? "🔥" : "📍"} {z.zona}
                    </div>
                    <div style={{ color: "#888", fontSize: 12 }}>{z.total_clientes} clientes · 🪙 {z.fichas_totales}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "users" && (
          <div style={{ padding: "20px 16px" }}>
            <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 16, fontSize: 18 }}>👥 Clientes ({users.length})</h2>
            {users.map(u => (
              <div key={u.id} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.nombre}</div>
                  <div style={{ color: "#666", fontSize: 12 }}>📍 {u.zona || "Sin zona"} · 📱 {u.celular}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#FFD700", fontWeight: 700 }}>🪙 {u.fichas}</div>
                    <NivelBadge nivel={u.nivel} />
                  </div>
                  <button onClick={() => handleAddFichas(u.id, 50)} style={{
                    background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none",
                    color: "#000", padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                    fontWeight: 700, fontSize: 12,
                  }}>+50</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 440, background: "rgba(10,10,26,0.97)",
        borderTop: "1px solid rgba(255,215,0,0.15)", display: "flex", padding: "8px 0",
        backdropFilter: "blur(20px)",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, border: "none", background: "transparent",
            color: tab === t.id ? "#FFD700" : "#555", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, padding: "8px 0", cursor: "pointer",
          }}>
            <span style={{ fontSize: 22, filter: tab === t.id ? "drop-shadow(0 0 8px #FFD700)" : "none" }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  if (screen === "login") {
    return <LoginScreen
      onLogin={(user) => { setCurrentUser(user); setScreen("client"); }}
      onAdminLogin={() => setScreen("admin")} />;
  }
  if (screen === "admin") return <AdminPanel onLogout={() => setScreen("login")} />;
  return <ClientApp user={currentUser} onLogout={() => setScreen("login")} />;
}
