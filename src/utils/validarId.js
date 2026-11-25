function parsearId(texto) {
  if (typeof texto !== 'string') return null;      // 1) ¿es un texto?
  if (!/^[1-9]\d{0,9}$/.test(texto)) return null;  // 2) formato
  const n = Number(texto);                         // 3) ahora a número
  if (n > 2147483647) return null;                        // 4) rango
    return n;
}

module.exports = { parsearId };