// ============================================================
// GEOLOCALIZACIÓN
// ============================================================
// Pide la ubicación del cliente al navegador.
// Devuelve { lat, lng, zona } o null si rechaza el permiso.

// Aproxima la zona de La Guajira según coordenadas.
function detectarZona(lat, lng) {
  const zonas = [
    { nombre: "Riohacha", lat: 11.5444, lng: -72.9072 },
    { nombre: "Maicao", lat: 11.3547, lng: -72.2386 },
    { nombre: "Manaure", lat: 11.7667, lng: -72.2333 },
    { nombre: "Uribia", lat: 11.7142, lng: -72.2658 },
    { nombre: "Albania", lat: 11.1614, lng: -72.5928 },
    { nombre: "Fonseca", lat: 10.8886, lng: -72.8475 },
    { nombre: "San Juan del Cesar", lat: 10.7708, lng: -73.0019 },
  ];

  let masCercana = zonas[0];
  let menorDist = Infinity;
  for (const z of zonas) {
    const d = Math.sqrt((lat - z.lat) ** 2 + (lng - z.lng) ** 2);
    if (d < menorDist) { menorDist = d; masCercana = z; }
  }
  return masCercana.nombre;
}

export function obtenerUbicacion() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        resolve({ lat, lng, zona: detectarZona(lat, lng) });
      },
      () => resolve(null), // rechazó el permiso
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}
