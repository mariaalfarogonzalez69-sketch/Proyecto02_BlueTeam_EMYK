package seguridad;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class ControlAccesoTest {

    @Disabled("Pendiente: Persona 2, requiere login y permisos reales")
    @Test
    void tc06_auditorEntraPorUrlAGestionDeRolesYRecibe403() {
        // Iniciar sesion como auditor y pedir directamente la URL de roles.
        // Esperado: HTTP 403.
    }

    @Disabled("Pendiente: Persona 2, requiere login y permisos reales")
    @Test
    void tc07_taquilleroIntentaBorrarUsuarioPorApiYRecibe403() {
        // Iniciar sesion como taquillero y enviar el borrado de un usuario por la ruta directa.
        // Esperado: HTTP 403 y el usuario sigue existiendo.
    }
}