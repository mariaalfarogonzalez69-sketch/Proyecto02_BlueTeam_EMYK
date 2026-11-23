package seguridad;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class AutenticacionTest {

    @Disabled("Pendiente: Persona 1, requiere el login real")
    @Test
    void tc05_sesionSeCierraTrasInactividad() {
        // 1. Iniciar sesion. 2. Esperar mas de 60 segundos. 3. Pedir una ruta interna.
        // Esperado: redireccion al login (sesion cerrada).
    }

    @Disabled("Pendiente: Persona 1, requiere token CSRF")
    @Test
    void tc08_formularioSinTokenCsrfEsRechazado() {
        // Enviar un POST modificador sin token CSRF.
        // Esperado: solicitud rechazada (403 u otro error controlado).
    }

    @Disabled("Pendiente: Persona 1, requiere el login real")
    @Test
    void tc09_cookieDeSesionEsHttpOnlyYSinDatosSensibles() {
        // Iniciar sesion y leer el encabezado Set-Cookie.
        // Esperado: contiene HttpOnly y no incluye usuario, rol ni contrasena.
    }
}