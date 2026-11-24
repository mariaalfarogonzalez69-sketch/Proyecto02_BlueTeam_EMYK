
package seguridad;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

class SeguridadTest {

    // La suite puede ejecutarse contra el sistema local o publicado.
    static final String BASE_URL =
            System.getenv().getOrDefault("BASE_URL", "http://localhost:3000");

    static final HttpClient CLIENT = HttpClient.newHttpClient();

    static final Pattern CAMPO_CSRF =
            Pattern.compile("name=\"_csrf\"\\s+value=\"([^\"]+)\"");

    // Obtiene una página y envía la cookie de sesión.
    static HttpResponse<String> get(String ruta, String cookie) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + ruta))
                .header("Cookie", cookie)
                .GET()
                .build();

        return CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // Obtiene una página pública.
    static HttpResponse<String> get(String ruta) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + ruta))
                .GET()
                .build();

        return CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // Envía un formulario utilizando la sesión y el token CSRF.
    static HttpResponse<String> post(
            String ruta, String cookie, String cuerpo) throws Exception {

        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + ruta))
                .header("Cookie", cookie)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(
                        cuerpo, StandardCharsets.UTF_8))
                .build();

        return CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // Codifica los valores de los formularios.
    static String codificar(String valor) {
        return URLEncoder.encode(valor, StandardCharsets.UTF_8);
    }

    // Obtiene el valor del campo CSRF de un formulario.
    static String extraerToken(String html) {
        Matcher matcher = CAMPO_CSRF.matcher(html);

        assertTrue(matcher.find(),
                "No se encontró el campo CSRF en el formulario");

        return matcher.group(1);
    }

    // Extrae la cookie sid de una respuesta.
    static String extraerCookieSid(HttpResponse<String> respuesta) {
        String setCookie = respuesta.headers()
                .firstValue("Set-Cookie")
                .orElse("");

        assertFalse(setCookie.isBlank(),
                "La respuesta no contiene Set-Cookie");

        String primeraParte = setCookie.split(";", 2)[0];

        assertTrue(primeraParte.startsWith("sid="),
                "No se encontró la cookie sid");

        return primeraParte;
    }

    // Inicia sesión con el usuario Taquillero.
    static String iniciarSesionTaquillero() throws Exception {

        // 1. Abrir el formulario de inicio de sesión.
        HttpResponse<String> login = get("/login");

        assertEquals(200, login.statusCode(),
                "No se pudo abrir el formulario de login");

        String cookieInicial = extraerCookieSid(login);
        String tokenLogin = extraerToken(login.body());

        // 2. Enviar las credenciales.
        String formulario =
                "username=" + codificar("taquillero")
                + "&password=" + codificar("Taqui#2026")
                + "&_csrf=" + codificar(tokenLogin);

        HttpResponse<String> respuestaLogin =
                post("/login", cookieInicial, formulario);

        assertEquals(302, respuestaLogin.statusCode(),
                "No se pudo iniciar sesión con el usuario Taquillero");

        // 3. Recuperar la cookie de la sesión autenticada.
        return extraerCookieSid(respuestaLogin);
    }

    // TC-10: Encabezados HTTP (UTN-08).
    @Test
    void tc10_encabezadosDeSeguridad() throws Exception {

        HttpResponse<String> r = get("/");
        var h = r.headers();

        assertTrue(h.firstValue("Content-Security-Policy").isPresent(),
                "Falta Content-Security-Policy");

        String xfo = h.firstValue("X-Frame-Options").orElse("");

        assertTrue(
                xfo.equalsIgnoreCase("DENY")
                        || xfo.equalsIgnoreCase("SAMEORIGIN"),
                "X-Frame-Options debe ser DENY o SAMEORIGIN, pero fue: " + xfo
        );

        assertEquals("nosniff",
                h.firstValue("X-Content-Type-Options").orElse(""),
                "X-Content-Type-Options debe ser nosniff");
    }

    // TC-03: XSS reflejado (UTN-07b).
    @Test
    void tc03_xssReflejadoNoSeEjecuta() throws Exception {

        String payload = "<script>alert(1)</script>";
        String q = codificar(payload);

        HttpResponse<String> r =
                get("/?q=" + q + "&buscar=" + q);

        assertFalse(r.body().contains(payload),
                "El payload aparece sin escapar en la respuesta");
    }

    // TC-04: XSS almacenado (UTN-07b).
    @Test
    void tc04_xssAlmacenadoNoSeEjecuta() throws Exception {

        // 1. Iniciar sesión como Taquillero.
        String cookie = iniciarSesionTaquillero();

        // 2. Abrir el formulario para crear un evento.
        HttpResponse<String> formularioEvento =
                get("/eventos/nuevo", cookie);

        assertEquals(200, formularioEvento.statusCode(),
                "El Taquillero no pudo acceder al formulario de eventos");

        String token = extraerToken(formularioEvento.body());

        // 3. Preparar los datos del evento.
        String payload = "<img src=x onerror=alert(1)>";

        String codigo = "XSS" + System.currentTimeMillis();

        String fecha = LocalDateTime.now()
                .plusDays(10)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));

        String cuerpo =
                "codigo=" + codificar(codigo)
                + "&nombre=" + codificar(payload)
                + "&lugar=" + codificar("Evento de prueba")
                + "&fecha=" + codificar(fecha)
                + "&capacidad=100"
                + "&precio=1000"
                + "&_csrf=" + codificar(token);

        // 4. Enviar el formulario para guardar el evento.
        HttpResponse<String> creacion =
                post("/eventos", cookie, cuerpo);

        assertEquals(302, creacion.statusCode(),
                "No se pudo crear el evento de prueba. Respuesta: "
                        + creacion.body());

        // 5. Consultar el catálogo de eventos.
        HttpResponse<String> catalogo =
                get("/eventos", cookie);

        assertEquals(200, catalogo.statusCode(),
                "No se pudo consultar el catálogo de eventos");

        // 6. Comprobar que el HTML se encuentra escapado.
        assertTrue(
                catalogo.body().contains("&lt;img"),
                "El nombre del evento no aparece escapado en HTML"
        );

        assertFalse(
                catalogo.body().contains(payload),
                "El payload aparece sin escapar en el catálogo"
        );
    }
}
