// Pide confirmación antes de enviar los formularios que tienen data-confirm.
// Está en un archivo propio porque la CSP no permite onclick ni scripts incrustados.
document.addEventListener('submit', function (e) {
  var mensaje = e.target.getAttribute('data-confirm');
  if (mensaje && !window.confirm(mensaje)) {
    e.preventDefault();
  }
});