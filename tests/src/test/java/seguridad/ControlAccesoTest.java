
package seguridad;

import static org.junit.jupiter.api.Assertions.*;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

class ControlAccesoTest {

    private static final String BASE_URL = SeguridadTest.BASE_URL;

    private static final Pattern PATRON_CSRF = Pattern.compile(
        "name=['\"]_csrf['\"][^>]*value=['\"]([^'\"]+)['\"]"
    );

    private static class Sesion {
        final HttpClient cliente;
        final String csrf;

        Sesion(HttpClient cliente, String csrf) {
            this.cliente = cliente;
            this.csrf = csrf;
        }
    }

    private static Sesion iniciarSesion(String username, String password)
            throws Exception {

        CookieManager cookies = new CookieManager();
        cookies.setCookiePolicy(CookiePolicy.ACCEPT_ALL);

        HttpClient cliente = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        // Obtener el formulario de inicio de sesión y su token CSRF.
        HttpRequest solicitudLogin = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/login"))
                .GET()
                .build();

        HttpResponse<String> paginaLogin = cliente.send(
                solicitudLogin,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, paginaLogin.statusCode(),
                "No se pudo abrir el formulario de inicio de sesión.");

        String csrfLogin = extraerCsrf(paginaLogin.body());

        String formulario = "username=" + codificar(username)
                + "&password=" + codificar(password)
                + "&_csrf=" + codificar(csrfLogin);

        HttpRequest solicitudAutenticacion = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formulario))
                .build();

        HttpResponse<String> respuestaLogin = cliente.send(
                solicitudAutenticacion,
                HttpResponse.BodyHandlers.ofString()
        );

        assertTrue(
                respuestaLogin.statusCode() == 302
                        || respuestaLogin.statusCode() == 303,
                "No se pudo iniciar sesión con el usuario " + username
                        + ". Código HTTP: " + respuestaLogin.statusCode()
        );

        // Obtener un token de la sesión autenticada.
        HttpRequest solicitudInicio = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/"))
                .GET()
                .build();

        HttpResponse<String> paginaInicio = cliente.send(
                solicitudInicio,
                HttpResponse.BodyHandlers.ofString()
        );

        String csrfAutenticado = extraerCsrf(paginaInicio.body());

        return new Sesion(cliente, csrfAutenticado);
    }

    private static String extraerCsrf(String html) {
        Matcher matcher = PATRON_CSRF.matcher(html);

        assertTrue(matcher.find(),
                "No se encontró el token CSRF en el formulario HTML.");

        return matcher.group(1);
    }

    private static String codificar(String valor) {
        return URLEncoder.encode(valor, StandardCharsets.UTF_8);
    }

    // TC-06: un Auditor no puede acceder directamente a la gestión de roles.
    @Test
    void tc06_auditorEntraPorUrlAGestionDeRolesYRecibe403()
            throws Exception {

        Sesion sesion = iniciarSesion("auditor", "Audit#2026");

        HttpRequest solicitud = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/roles"))
                .GET()
                .build();

        HttpResponse<String> respuesta = sesion.cliente.send(
                solicitud,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(403, respuesta.statusCode(),
                "El Auditor no debería acceder a la gestión de roles.");
    }

    // TC-07: un Taquillero no puede eliminar usuarios.
        @Test
        void tc07_taquilleroIntentaBorrarUsuarioPorApiYRecibe403()
                throws Exception {

        // Crear una sesión independiente de SuperAdmin.
        Sesion sesionAdmin = iniciarSesion(
                "superadmin",
                "Super#2026"
        );

        // Comprobar que el usuario auditor existe antes del intento.
        HttpRequest consultarAntes = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/usuarios"))
                .GET()
                .build();

        HttpResponse<String> antes = sesionAdmin.cliente.send(
                consultarAntes,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, antes.statusCode());
        assertTrue(antes.body().contains("auditor"),
                "El usuario auditor debe existir antes del intento.");

        // Iniciar sesión como Taquillero.
        Sesion sesionTaquillero = iniciarSesion(
                "taquillero",
                "Taqui#2026"
        );

        String formulario = "_csrf=" + codificar(sesionTaquillero.csrf);

        // Intentar eliminar al usuario auditor (ID 2 según seed.sql).
        HttpRequest solicitudEliminar = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/usuarios/2/eliminar"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formulario))
                .build();

        HttpResponse<String> respuestaEliminar =
                sesionTaquillero.cliente.send(
                        solicitudEliminar,
                        HttpResponse.BodyHandlers.ofString()
                );

        assertEquals(403, respuestaEliminar.statusCode(),
                "El Taquillero no debería poder eliminar usuarios.");

        // Comprobar que el usuario sigue existiendo.
        HttpResponse<String> despues = sesionAdmin.cliente.send(
                consultarAntes,
                HttpResponse.BodyHandlers.ofString()
        );

        assertEquals(200, despues.statusCode());
        assertTrue(despues.body().contains("auditor"),
                "El usuario auditor debe seguir existiendo después del intento.");
        }
}
