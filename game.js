import { supabase } from "./supabase";

// ============================================================
// MOTOR DE JUEGO (Algoritmo RTP)
// ============================================================
export const SYMBOLS = ["🍋", "🍒", "⭐", "💎", "🔔", "7️⃣", "🌴"];
const SYMBOL_WEIGHTS = [30, 25, 20, 10, 8, 5, 2];

export const PAYTABLE = {
  "7️⃣7️⃣7️⃣": 50,
  "💎💎💎": 30,
  "🔔🔔🔔": 20,
  "⭐⭐⭐": 15,
  "🍒🍒🍒": 10,
  "🌴🌴🌴": 8,
  "🍋🍋🍋": 5,
  "🍒🍒": 2,
  "⭐⭐": 1.5,
};

export function weightedRandom() {
  const total = SYMBOL_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= SYMBOL_WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

export function spinReels(bet, nearMissRate = 0.3) {
  const reels = [weightedRandom(), weightedRandom(), weightedRandom()];
  const key3 = reels.join("");
  const key2 = reels[0] + reels[1];

  let multiplier = 0;
  if (PAYTABLE[key3]) multiplier = PAYTABLE[key3];
  else if (PAYTABLE[key2]) multiplier = PAYTABLE[key2];

  if (multiplier === 0 && Math.random() < nearMissRate) {
    reels[1] = reels[0];
  }

  const win = multiplier > 0 ? Math.floor(bet * multiplier) : 0;
  return { reels, win, multiplier };
}

// ============================================================
// AUTENTICACIÓN
// ============================================================
// Login simple por celular + contraseña.
// NOTA: Para producción real, lo ideal es usar Supabase Auth.
// Esta versión usa la tabla 'usuarios' directamente.

export async function loginUsuario(celular, password) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("celular", celular)
    .eq("activo", true)
    .single();

  if (error || !data) {
    return { user: null, error: "Número no registrado" };
  }

  // OJO: En producción usa hash real (bcrypt). Aquí comparación simple.
  if (data.password_hash !== password) {
    return { user: null, error: "Contraseña incorrecta" };
  }

  return { user: data, error: null };
}

// ============================================================
// USUARIOS
// ============================================================
export async function getUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("creado_en", { ascending: false });
  return { data: data || [], error };
}

export async function crearUsuario({ nombre, celular, password, fichas, lat, lng, zona }) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{
      nombre,
      celular,
      password_hash: password, // En producción: hashear antes
      fichas: fichas || 0,
      nivel: "Bronze",
      lat,
      lng,
      zona,
    }])
    .select()
    .single();
  return { data, error };
}

// ============================================================
// FICHAS Y TRANSACCIONES
// ============================================================
export async function actualizarFichas(usuarioId, delta, tipo, juego = null) {
  // 1. Leer saldo actual
  const { data: user } = await supabase
    .from("usuarios")
    .select("fichas")
    .eq("id", usuarioId)
    .single();

  if (!user) return { error: "Usuario no encontrado" };

  const nuevoSaldo = Math.max(0, user.fichas + delta);

  // 2. Actualizar saldo
  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ fichas: nuevoSaldo })
    .eq("id", usuarioId);

  if (updateError) return { error: updateError };

  // 3. Registrar transacción (auditoría)
  await supabase.from("transacciones").insert([{
    usuario_id: usuarioId,
    tipo,
    cantidad: delta,
    juego,
    saldo_despues: nuevoSaldo,
  }]);

  return { nuevoSaldo, error: null };
}

// ============================================================
// JUGADAS
// ============================================================
export async function registrarJugada(usuarioId, juego, apuesta, resultado, premio) {
  const { error } = await supabase.from("jugadas").insert([{
    usuario_id: usuarioId,
    juego,
    apuesta,
    resultado,
    premio,
  }]);
  return { error };
}

// ============================================================
// RANKING Y ZONAS (usan las vistas SQL)
// ============================================================
export async function getRankingSemanal() {
  const { data, error } = await supabase
    .from("ranking_semanal")
    .select("*")
    .limit(20);
  return { data: data || [], error };
}

export async function getResumenZonas() {
  const { data, error } = await supabase
    .from("resumen_zonas")
    .select("*");
  return { data: data || [], error };
}

// ============================================================
// CONFIG (RTP, bonos, etc.)
// ============================================================
export async function getConfig() {
  const { data } = await supabase.from("config").select("*");
  const config = {};
  (data || []).forEach(c => { config[c.clave] = c.valor; });
  return config;
}
