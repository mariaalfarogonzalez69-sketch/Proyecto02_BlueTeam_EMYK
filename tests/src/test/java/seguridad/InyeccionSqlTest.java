package seguridad;

import static org.junit.jupiter.api.Assertions.*;

import java.net.CookieManager;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

// UTN-07a: SQL Injection. Casos TC-01 y TC-02.
// Requisitos: servidor encendido (npm run dev) y base de datos con seed.sql cargado.
// La URL sale de SeguridadTest.BASE_URL (variable BASE_URL). Las credenciales de
// prueba se pueden cambiar con TEST_USER y TEST_PASSWORD (por defecto, las del README).
class InyeccionSqlTest {

    static final String BASE_URL = SeguridadTest.BASE_URL;
    static final String USUARIO = System.getenv().getOrDefault("TEST_USER", "taquillero");
    static final String CLAVE = System.getenv().getOrDefault("TEST_PASSWORD", "Taqui#2026");

    private static final Pattern TOKEN_CSRF = Pattern.compile("name=\"_csrf\"\\s+value=\"([^\"]+)\"");

    // Un cliente nuevo por caso: guarda la cookie de sesión y NO sigue
    // redirecciones,
    // para ver el código real (302, 403...) que responde el servidor.
    private static HttpClient nuevoCliente() {
        return HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static HttpResponse<String> get(HttpClient c, String ruta) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + ruta)).GET().build();
        return c.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // El login exige token CSRF: se pide la página y se saca el token del
    // formulario.
    // La cookie de sesión queda guardada en el cliente.
    private static String tokenCsrf(HttpClient c) throws Exception {
        HttpResponse<String> pagina = get(c, "/login");
        Matcher m = TOKEN_CSRF.matcher(pagina.body());
        assertTrue(m.find(), "No se encontró el token CSRF en /login (código " + pagina.statusCode() + ")");
        return m.group(1);
    }

    private static HttpResponse<String> login(HttpClient c, String usuario, String clave)
            throws Exception {
        String cuerpo = "username=" + enc(usuario) + "&password=" + enc(clave)
                + "&_csrf=" + enc(tokenCsrf(c));
        HttpRequest req = HttpRequest.newBuilder(URI.create(BASE_URL + "/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(cuerpo))
                .build();
        return c.send(req, HttpResponse.BodyHandlers.ofString());
    }

    // TC-01: login con ' OR '1'='1 en el usuario.
    // Esperado: acceso denegado o error controlado, sin sesión iniciada.
    @Test
    void tc01_loginConInyeccionSqlEsDenegado() throws Exception {
        HttpClient cliente = nuevoCliente();

        HttpResponse<String> r = login(cliente, "' OR '1'='1", "cualquierCosa");
        assertTrue(r.statusCode() < 500,
                "Error del servidor con la inyección (código " + r.statusCode() + ")");

        // Sin sesión: una ruta interna debe mandar de vuelta al login.
        HttpResponse<String> interna = get(cliente, "/eventos");
        assertEquals(302, interna.statusCode(),
                "Con la inyección se obtuvo acceso a una ruta interna");
        assertTrue(interna.headers().firstValue("Location").orElse("").contains("/login"),
                "La ruta interna debía redirigir al login");

        // Variante con comentario SQL, con la contraseña también inyectada.
        HttpResponse<String> r2 = login(cliente, "admin' --", "' OR '1'='1");
        assertTrue(r2.statusCode() < 500, "Error del servidor con la segunda inyección");
        assertEquals(302, get(cliente, "/eventos").statusCode(),
                "La segunda inyección dio acceso a una ruta interna");
    }

    // TC-02: búsqueda con ' UNION SELECT ... --
    // Esperado: sin datos expuestos ni errores de base de datos en la respuesta.
    @Test
    void tc02_busquedaConUnionSelectNoExponeDatos() throws Exception {
        HttpClient cliente = nuevoCliente();

        // La búsqueda exige sesión: se entra con un usuario de prueba válido.
        HttpResponse<String> entrada = login(cliente, USUARIO, CLAVE);
        assertEquals(302, entrada.statusCode(),
                "No se pudo iniciar sesión con el usuario de prueba " + USUARIO);

        // Control: la búsqueda normal funciona (así el caso no pasa "en vacío").
        assertEquals(200, get(cliente, "/eventos?q=" + enc("concierto")).statusCode(),
                "La búsqueda normal debía responder 200");

        // El buscador corta el texto a 120 caracteres: el payload es más corto.
        String payload = "' UNION SELECT id,username,password_hash,correo,1,1,1,1,1 FROM usuarios --";
        HttpResponse<String> r = get(cliente, "/eventos?q=" + enc(payload));
        String cuerpo = r.body();

        assertEquals(200, r.statusCode(), "La búsqueda con inyección no respondió 200");

        // Sin datos de la tabla usuarios (hashes bcrypt y correos de prueba del seed).
        assertFalse(cuerpo.contains("$2b$") || cuerpo.contains("$2a$"),
                "La respuesta expone hashes de contraseña");
        assertFalse(cuerpo.contains("superadmin@example.com")
                || cuerpo.contains("auditor@example.com")
                || cuerpo.contains("taquillero@example.com"),
                "La respuesta expone correos de usuarios");

        // Sin errores de base de datos visibles.
        String minusculas = cuerpo.toLowerCase();
        assertFalse(minusculas.contains("syntax error")
                || minusculas.contains("sequelize")
                || minusculas.contains("postgres")
                || minusculas.contains("unterminated"),
                "La respuesta muestra detalles de un error de base de datos");
    }
}