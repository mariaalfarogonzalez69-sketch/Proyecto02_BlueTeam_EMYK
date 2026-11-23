package seguridad;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class SeguridadTest {

    // La suite corre contra el sistema local o el publicado: BASE_URL=https://... mvn test
    static final String BASE_URL =
            System.getenv().getOrDefault("BASE_URL", "http://localhost:3000");

    static final HttpClient CLIENT = HttpClient.newHttpClient();

    static HttpResponse<String> get(String ruta) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + ruta)).GET().build();
        return CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // TC-10: Encabezados HTTP (UTN-08)
    @Test
    void tc10_encabezadosDeSeguridad() throws Exception {
        HttpResponse<String> r = get("/");
        var h = r.headers();

        assertTrue(h.firstValue("Content-Security-Policy").isPresent(),
                "Falta Content-Security-Policy");

        String xfo = h.firstValue("X-Frame-Options").orElse("");
        assertTrue(xfo.equalsIgnoreCase("DENY") || xfo.equalsIgnoreCase("SAMEORIGIN"),
                "X-Frame-Options debe ser DENY o SAMEORIGIN, pero fue: " + xfo);

        assertEquals("nosniff", h.firstValue("X-Content-Type-Options").orElse(""),
                "X-Content-Type-Options debe ser nosniff");
    }

    // TC-03: XSS reflejado (UTN-07b)
    @Test
    void tc03_xssReflejadoNoSeEjecuta() throws Exception {
        String payload = "<script>alert(1)</script>";
        String q = URLEncoder.encode(payload, StandardCharsets.UTF_8);

        HttpResponse<String> r = get("/?q=" + q + "&buscar=" + q);

        assertFalse(r.body().contains(payload),
                "El payload aparece sin escapar en la respuesta");
    }

    // TC-04: XSS almacenado (UTN-07b). Se activa cuando existan los formularios de eventos.
    @Disabled("Pendiente: requiere el formulario de crear evento y sesion (ramas de las companeras)")
    @Test
    void tc04_xssAlmacenadoNoSeEjecuta() {
        // Plan: iniciar sesion, crear un evento con <img src=x onerror=alert(1)> en nombre/lugar,
        // pedir el catalogo y verificar que el HTML llega escapado (&lt;img ...).
    }
}