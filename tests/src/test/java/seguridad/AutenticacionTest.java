package seguridad;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class AutenticacionTest {

    static final String BASE_URL = SeguridadTest.BASE_URL;

    // Usuario de prueba del README. Se puede cambiar con TEST_USER y TEST_PASSWORD.
    static final String USUARIO = System.getenv().getOrDefault("TEST_USER", "superadmin");
    static final String CLAVE = System.getenv().getOrDefault("TEST_PASSWORD", "Super#2026");

    // TC-05: el sistema cierra la sesión a los 60 s; se espera un poco más
    static final long ESPERA_SESION_SEGUNDOS =
            Long.parseLong(System.getenv().getOrDefault("ESPERA_SESION_SEGUNDOS", "62"));

    // Sin redirecciones automáticas: aquí hay que ver el 302 y el 403 tal cual
    static final HttpClient CLIENTE =
            HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();

    // Campo oculto del formulario: <input type="hidden" name="_csrf" value="...">
    static final Pattern CAMPO_CSRF = Pattern.compile("name=\"_csrf\"\\s+value=\"([^\"]+)\"");

    // cookie = lo que el navegador reenvía ("sid=..."); setCookie = la línea completa con sus atributos
    record Sesion(String cookie, String setCookie) {}

    // ---------- Ayudas ----------

    static String codificar(String texto) {
        return URLEncoder.encode(texto, StandardCharsets.UTF_8);
    }

    static HttpResponse<String> get(String ruta, String cookie) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(BASE_URL + ruta)).GET();
        if (cookie != null) b.header("Cookie", cookie);
        return CLIENTE.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    static HttpResponse<String> post(String ruta, String cookie, String cuerpo) throws Exception {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(BASE_URL + ruta))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(cuerpo));
        if (cookie != null) b.header("Cookie", cookie);
        return CLIENTE.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    // Línea Set-Cookie completa de la cookie de sesión (sid)
    static String setCookieSid(HttpResponse<?> r) {
        return r.headers().allValues("Set-Cookie").stream()
                .filter(c -> c.startsWith("sid="))
                .findFirst()
                .orElseThrow(() -> new AssertionError("La respuesta no trae la cookie sid"));
    }

    // De "sid=abc; Path=/; HttpOnly" deja solo "sid=abc"
    static String soloParCookie(String setCookie) {
        return setCookie.split(";", 2)[0];
    }

    static String ubicacion(HttpResponse<?> r) {
        return r.headers().firstValue("Location").orElse("");
    }

    static String extraerToken(String html) {
        Matcher m = CAMPO_CSRF.matcher(html);
        assertTrue(m.find(), "No se encontró el campo _csrf en el formulario de login");
        return m.group(1);
    }

    // Inicia sesión como lo haría un navegador: pide el formulario (token + cookie) y lo envía
    static Sesion iniciarSesion() throws Exception {
        HttpResponse<String> pagina = get("/login", null);
        String cookieInicial = soloParCookie(setCookieSid(pagina));
        String token = extraerToken(pagina.body());

        HttpResponse<String> r = post("/login", cookieInicial,
                "username=" + codificar(USUARIO) + "&password=" + codificar(CLAVE) + "&_csrf=" + codificar(token));
        assertEquals(302, r.statusCode(), "El login con las credenciales de prueba debe redirigir (302)");

        // Al entrar se crea una sesión NUEVA (otra cookie sid)
        String setCookie = setCookieSid(r);
        return new Sesion(soloParCookie(setCookie), setCookie);
    }

    // ---------- Casos ----------

     // TC-05: la sesión se cierra tras 60 s de inactividad (UTN-07c). Tarda un poco más de un minuto.
    @Test
    void tc05_sesionSeCierraTrasInactividad () throws Exception {
        // 1. Iniciar sesion.
        Sesion s = iniciarSesion();

        //2. Esperar mas de 60 segundos.
        // Recién iniciada, una ruta interna responde 200
        assertEquals(200, get("/", s.cookie()).statusCode(), "Con sesión válida, la página interna debe cargar");

        // Sin tocar nada durante más de 60 s (se reenvía la MISMA cookie: lo que vence es la sesión del servidor)
        Thread.sleep(ESPERA_SESION_SEGUNDOS * 1000);

        //3. Pedir una ruta interna.
        // Esperado: redireccion al login (sesion cerrada).
        HttpResponse<String> r = get("/", s.cookie());
        assertEquals(302, r.statusCode(), "Tras la inactividad, la ruta interna debe redirigir");
        assertTrue(ubicacion(r).contains("/login"), "La redirección debe ir al login, pero fue a: " + ubicacion(r));
    }

    // TC-08: un formulario sin token CSRF es rechazado (UTN-07d)
    @Test
    void tc08_formularioSinTokenCsrfEsRechazado() throws Exception {
        Sesion s = iniciarSesion();

        // 1. Con sesión válida, un POST que modifica (cerrar sesión) SIN token debe dar 403
        HttpResponse<String> sinToken = post("/logout", s.cookie(), "");
        assertEquals(403, sinToken.statusCode(), "Un POST sin token CSRF debe responder 403");

        // 2. El ataque no logró su objetivo: la sesión sigue abierta
        assertEquals(200, get("/", s.cookie()).statusCode(), "El POST sin token no debe cerrar la sesión");

        // 3. Login con la contraseña correcta pero SIN token: no debe iniciar sesión
        // Esperado: solicitud rechazada (403 u otro error controlado).
        HttpResponse<String> pagina = get("/login", null);
        String cookieInicial = soloParCookie(setCookieSid(pagina));
        HttpResponse<String> loginSinToken = post("/login", cookieInicial,
                "username=" + codificar(USUARIO) + "&password=" + codificar(CLAVE));
        int estado = loginSinToken.statusCode();
        assertTrue(estado == 403 || (estado == 302 && ubicacion(loginSinToken).contains("/login")),
                "El login sin token debe ser rechazado, pero respondió " + estado + " hacia " + ubicacion(loginSinToken));
        assertEquals(302, get("/", cookieInicial).statusCode(), "Sin token no debe quedar ninguna sesión iniciada");
    }

    // TC-09: la cookie de sesión es HttpOnly y no lleva datos sensibles (UTN-07c)
    @Test
    void tc09_cookieDeSesionEsHttpOnlyYSinDatosSensibles() throws Exception {
        // Iniciar sesion y leer el encabezado Set-Cookie.
        Sesion s = iniciarSesion();
        String atributos = s.setCookie().toLowerCase();

        assertTrue(atributos.contains("httponly"), "La cookie de sesión debe ser HttpOnly: " + s.setCookie());
        assertTrue(atributos.contains("samesite=strict"), "La cookie debe llevar SameSite=Strict: " + s.setCookie());
        if (BASE_URL.startsWith("https")) {
            assertTrue(atributos.contains("secure"), "Con HTTPS la cookie debe ser Secure: " + s.setCookie());
        }

        // El valor de la cookie es solo un identificador aleatorio: sin usuario, rol ni contraseña
        // Esperado: contiene HttpOnly y no incluye usuario, rol ni contrasena.
        String valor = soloParCookie(s.setCookie()).toLowerCase();
        for (String prohibido : List.of(USUARIO, CLAVE, codificar(CLAVE), "superadmin", "auditor", "taquillero")) {
            assertFalse(valor.contains(prohibido.toLowerCase()),
                    "La cookie no debe contener datos del usuario: " + prohibido);
        }
    }
}