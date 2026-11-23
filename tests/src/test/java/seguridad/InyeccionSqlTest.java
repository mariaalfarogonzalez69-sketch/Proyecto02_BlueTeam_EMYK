package seguridad;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class InyeccionSqlTest {

    @Disabled("Pendiente: Persona 3, requiere el login real")
    @Test
    void tc01_loginConInyeccionSqlEsDenegado() {
        // Enviar el login con usuario: ' OR '1'='1
        // Esperado: acceso denegado o error controlado, sin sesion iniciada.
    }

    @Disabled("Pendiente: Persona 3, requiere la busqueda de eventos")
    @Test
    void tc02_busquedaConUnionSelectNoExponeDatos() {
        // Buscar con: ' UNION SELECT ... --
        // Esperado: sin datos expuestos ni errores de base de datos en la respuesta.
    }
}