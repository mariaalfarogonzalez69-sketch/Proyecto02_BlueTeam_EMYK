package seguridad;

import static org.junit.jupiter.api.Assertions.*;
import static seguridad.SeguridadTest.codificar;
import static seguridad.SeguridadTest.extraerCookieSid;
import static seguridad.SeguridadTest.extraerToken;
import static seguridad.SeguridadTest.get;
import static seguridad.SeguridadTest.iniciarSesionTaquillero;
import static seguridad.SeguridadTest.post;

import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.Test;

// UTN-07b: XSS en otros campos (además del nombre del evento, que cubre TC-04).
// Cada caso cumple si el payload se RECHAZA o se MUESTRA ESCAPADO; nunca crudo.
// Requisitos: servidor encendido y seed.sql cargado (usuarios superadmin y taquillero).
class XssCamposTest {

    static final String IMG = "<img src=x onerror=alert(1)>";
    static final String SCRIPT = "<script>alert(1)</script>";

    static final String CLAVE_SUPERADMIN =
            System.getenv().getOrDefault("TEST_PASSWORD_SUPERADMIN", "Super#2026");

    // Inicia sesión con cualquier usuario de prueba.
    static String iniciarSesion(String usuario, String clave) throws Exception {
        HttpResponse<String> login = get("/login");
        String cookieInicial = extraerCookieSid(login);
        String token = extraerToken(login.body());

        HttpResponse<String> r = post("/login", cookieInicial,
                "username=" + codificar(usuario)
                        + "&password=" + codificar(clave)
                        + "&_csrf=" + codificar(token));

        assertEquals(302, r.statusCode(),
                "No se pudo iniciar sesión como " + usuario);
        return extraerCookieSid(r);
    }

    // El HTML no puede traer el payload tal cual: debe ir escapado (&lt;img ...).
    static void assertSinHtmlCrudo(String html, String donde) {
        assertFalse(html.contains("<img src=x"),
                "El payload <img> aparece sin escapar en " + donde);
        assertFalse(html.contains("<script>alert(1)"),
                "El payload <script> aparece sin escapar en " + donde);
    }

    // Si el servidor aceptó el dato (302) se revisa el listado; si lo rechazó,
    // se revisa que la página de error o el formulario no devuelva el payload crudo.
    static void verificar(HttpResponse<String> envio, String listado, String cookie,
            String donde) throws Exception {
        String html = (envio.statusCode() == 302)
                ? get(listado, cookie).body()
                : envio.body();
        assertTrue(envio.statusCode() < 500,
                "Error del servidor al enviar el payload a " + donde);
        assertSinHtmlCrudo(html, donde);
    }

    // XSS almacenado en el campo "lugar" del evento.
    @Test
    void tc04b_xssAlmacenadoEnLugarDelEvento() throws Exception {
        String cookie = iniciarSesionTaquillero();
        String token = extraerToken(get("/eventos/nuevo", cookie).body());

        String fecha = LocalDateTime.now().plusDays(10)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));

        String cuerpo = "codigo=" + codificar("XSSL" + System.currentTimeMillis())
                + "&nombre=" + codificar("Evento XSS lugar")
                + "&lugar=" + codificar(IMG)
                + "&fecha=" + codificar(fecha)
                + "&capacidad=50&precio=1000"
                + "&_csrf=" + codificar(token);

        verificar(post("/eventos", cookie, cuerpo), "/eventos", cookie, "evento (lugar)");
    }

    // XSS reflejado en el buscador, intentando romper el atributo value="...".
    @Test
    void tc04c_xssReflejadoEnBuscadorDeEventos() throws Exception {
        String cookie = iniciarSesionTaquillero();
        String q = "\"><img src=x onerror=alert(1)>";

        HttpResponse<String> r = get("/eventos?q=" + codificar(q), cookie);

        assertEquals(200, r.statusCode(), "No se pudo abrir /eventos?q=");
        assertSinHtmlCrudo(r.body(), "/eventos?q=");
    }

    // XSS almacenado en el nombre de un rol (lo crea el SuperAdmin).
    @Test
    void tc04d_xssAlmacenadoEnNombreDeRol() throws Exception {
        String cookie = iniciarSesion("superadmin", CLAVE_SUPERADMIN);
        String token = extraerToken(get("/roles/nuevo", cookie).body());

        String cuerpo = "nombre=" + codificar(IMG)
                + "&_csrf=" + codificar(token);

        verificar(post("/roles", cookie, cuerpo), "/roles", cookie, "rol (nombre)");
    }

    // XSS almacenado en nombre e identificación de un usuario.
    @Test
    void tc04e_xssAlmacenadoEnDatosDeUsuario() throws Exception {
        String cookie = iniciarSesion("superadmin", CLAVE_SUPERADMIN);
        String token = extraerToken(get("/usuarios/nuevo", cookie).body());
        long marca = System.currentTimeMillis();

        String cuerpo = "username=" + codificar("xss" + marca)
                + "&nombre=" + codificar(IMG)
                + "&correo=" + codificar("xss" + marca + "@prueba.com")
                + "&identificacion=" + codificar(SCRIPT)
                + "&password=" + codificar("Clave#12345")
                + "&rol_id=3"
                + "&_csrf=" + codificar(token);

        verificar(post("/usuarios", cookie, cuerpo), "/usuarios", cookie, "usuario");
    }

    // XSS en el registro de auditoría: el usuario intentado en un login fallido
    // lo escribe el atacante y lo lee el SuperAdmin.
    @Test
    void tc04f_xssEnRegistroDeAuditoria() throws Exception {
        HttpResponse<String> login = get("/login");
        String cookieInicial = extraerCookieSid(login);
        String token = extraerToken(login.body());

        post("/login", cookieInicial,
                "username=" + codificar(IMG)
                        + "&password=" + codificar("x")
                        + "&_csrf=" + codificar(token));

        String cookie = iniciarSesion("superadmin", CLAVE_SUPERADMIN);
        HttpResponse<String> auditoria = get("/auditoria", cookie);

        assertEquals(200, auditoria.statusCode(), "SuperAdmin no pudo abrir /auditoria");
        assertSinHtmlCrudo(auditoria.body(), "/auditoria");
    }
}
