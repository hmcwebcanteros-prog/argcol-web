/**
 * SITIO argcol.com.ar — un solo script para todo el correo
 * ============================================================
 * Con UNA sola instalación quedan funcionando cuatro cosas:
 *   A) Suscripción al newsletter (formulario "Suscribirme").
 *   B) Formulario de contacto (guarda el mensaje y avisa por correo).
 *   C) Lista privada de suscriptores (para /admin/suscriptores/).
 *   D) Especiales + aviso diario de entradas nuevas por RSS.
 *
 * No hace falta crear ninguna hoja: el script crea solo el archivo
 * "Sitio argcol — datos" la primera vez y guarda ahí todo.
 *
 * Instalación (pasos completos en ayuda/GUIA-DEL-AUTOR.md):
 *   1) script.google.com → "Nuevo proyecto".
 *   2) Borrar lo que haya y pegar TODO este archivo.
 *   3) Reemplazar la línea de CLAVE por la clave larga (esp-...).
 *      El correo de destino NO se escribe: se usa el de la cuenta dueña.
 *   4) Guardar → Desplegar → Nueva implementación → Aplicación web:
 *        - Ejecutar como: Yo
 *        - Quién tiene acceso: Todos
 *   5) Autorizar con la cuenta (es una app propia, no verificada).
 *   6) Copiar la URL que termina en /exec y pasársela al asistente.
 *
 * Límite de Gmail gratuito: ~100 correos por día.
 */

// Clave larga que protege la lista privada y el envío de especiales.
// Pegar la clave entregada por el asistente (empieza con "esp-").
const CLAVE = "PEGAR-LA-CLAVE-ESP";

// Opcional: si se deja vacío, los avisos van al correo de la cuenta que
// despliega el script (Session.getEffectiveUser()). No hace falta tocarlo.
const DESTINO = "";

// El RSS del sitio: ahí aparecen las entradas publicadas.
const RSS_URL = "https://argcol.com.ar/rss.xml";

const HOJA_SUSCRIPTORES = "suscriptores";
const HOJA_ENVIADOS = "enviados";
const HOJA_CONTACTO = "mensajes";
const PROP_LIBRO = "LIBRO_ID";

// Frenos anti-spam. Una aplicación web de Apps Script NO recibe la IP del
// visitante, así que el límite es global por hora y se apoya también en el
// honeypot (campo "website") y en no repetir correos ya suscriptos.
// Un lector normal nunca llega a estos números; un robot, sí.
const MAX_CONTACTO_POR_HORA = 10;
const MAX_NEWSLETTER_POR_HORA = 40;
const HORA_MS = 60 * 60 * 1000;

/* ------------------------------------------------------------------ utilidades */

/** El archivo de datos: lo crea la primera vez y recuerda su ID. */
function libro() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(PROP_LIBRO);
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (err) {
      // si el archivo se borró, se crea uno nuevo
    }
  }
  const ss = SpreadsheetApp.create("Sitio argcol — datos");
  props.setProperty(PROP_LIBRO, ss.getId());
  return ss;
}

function hoja(nombre, columnas) {
  const ss = libro();
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.appendRow(columnas);
    h.setFrozenRows(1);
  }
  return h;
}

function responder(ok, nota) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok, nota: nota || "" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Devuelve un JSON con campos arbitrarios (usado por la lista privada). */
function responderObjeto(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function claveConfigurada() {
  return CLAVE.indexOf("PEGAR") === -1 && CLAVE.length > 8;
}

/**
 * Contador por hora guardado en las propiedades del script.
 * Devuelve true mientras no se supere el máximo; pasado ese número, false.
 * Se reinicia sola al entrar una nueva hora.
 */
function permite(nombre, maximo) {
  const props = PropertiesService.getScriptProperties();
  const prop = "FRENO_" + nombre;
  let estado;
  try {
    estado = JSON.parse(props.getProperty(prop) || "");
  } catch (err) {
    estado = null;
  }
  if (!estado || !estado.inicio || Date.now() - Number(estado.inicio) > HORA_MS) {
    estado = { inicio: Date.now(), n: 0 };
  }
  estado.n = Number(estado.n || 0) + 1;
  props.setProperty(prop, JSON.stringify(estado));
  return estado.n <= maximo;
}

/* ------------------------------------------------------------------ A: suscribir */

function suscriptores() {
  const h = hoja(HOJA_SUSCRIPTORES, ["fecha", "email", "origen"]);
  const filas = h.getLastRow() > 1 ? h.getRange(2, 2, h.getLastRow() - 1, 1).getValues().flat() : [];
  const unicos = [];
  for (const valor of filas) {
    const email = String(valor).trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && unicos.indexOf(email) === -1) {
      unicos.push(email);
    }
  }
  return unicos;
}

function suscribir(p) {
  const email = String(p.email || "").trim().toLowerCase();
  const origen = String(p.origen || "sitio");

  // honeypot: los bots rellenan el campo "website"; los humanos no lo ven
  if (String(p.website || "")) return responder(true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return responder(true);

  const h = hoja(HOJA_SUSCRIPTORES, ["fecha", "email", "origen"]);
  if (suscriptores().indexOf(email) !== -1) return responder(true); // ya estaba

  // Avalancha de alta de correos: se finge éxito y no se escribe nada.
  if (!permite("newsletter", MAX_NEWSLETTER_POR_HORA)) return responder(true);

  h.appendRow([new Date(), email, origen]);
  return responder(true);
}

/* ------------------------------------------------------------------ B: contacto */

function enviarContacto(p) {
  if (String(p.website || "")) return responder(true); // honeypot

  const nombre = String(p.nombre || "").trim().slice(0, 120);
  const email = String(p.email || "").trim().toLowerCase().slice(0, 160);
  const asunto = String(p.asunto || "Otro").trim().slice(0, 60);
  const mensaje = String(p.mensaje || "").trim().slice(0, 5000);

  if (!nombre) return responder(false, "Falta el nombre.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return responder(false, "El correo no es válido.");
  if (!mensaje) return responder(false, "Falta el mensaje.");

  // 1) queda registrado siempre, con fecha
  hoja(HOJA_CONTACTO, ["fecha", "nombre", "email", "asunto", "mensaje"])
    .appendRow([new Date(), nombre, email, asunto, mensaje]);

  // 2) freno al aviso por correo: el mensaje NO se pierde (ya quedó en la
  // hoja), pero si llegan más de 10 contactos en una hora se deja de avisar
  // por correo un rato. Así un robot no agota la cuota de Gmail.
  if (!permite("contacto", MAX_CONTACTO_POR_HORA)) {
    return responder(true, "Mensaje guardado. El aviso por correo se reanuda en unos minutos.");
  }

  // 3) aviso por correo al dueño del script (sin escribir el correo en el código)
  const para = DESTINO.indexOf("@") !== -1 ? DESTINO : Session.getEffectiveUser().getEmail();
  if (para) {
    MailApp.sendEmail({
      to: para,
      replyTo: email,
      subject: "Contacto web · " + asunto + " — " + nombre,
      body:
        "Mensaje desde argcol.com.ar\n" +
        "----------------------------------------\n" +
        "Nombre: " + nombre + "\n" +
        "Correo: " + email + "\n" +
        "Asunto: " + asunto + "\n\n" +
        mensaje + "\n",
    });
  }

  return responder(true);
}

/* ------------------------------------------------------------------ C: lista privada */

/**
 * Devuelve la lista de suscriptores (para /admin/suscriptores/ del sitio).
 * Solo responde si la clave coincide; nunca queda público.
 * Se llama por POST con accion=lista y la clave en el CUERPO de la petición:
 * así la clave no queda en la barra del navegador ni en los registros.
 * Se conserva el acceso por GET solo mientras se publica el cambio, para no
 * romper la versión anterior de la página.
 */
function listarSuscriptores(p) {
  if (!claveConfigurada()) return responder(false, "Falta configurar la clave en el script de Google.");
  if (String(p.clave || "") !== CLAVE) return responder(false, "Clave inválida.");

  const h = hoja(HOJA_SUSCRIPTORES, ["fecha", "email", "origen"]);
  const filas = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 3).getValues() : [];
  const lista = filas
    .map(function (f) {
      return {
        fecha: f[0] instanceof Date ? f[0].toISOString() : String(f[0] || ""),
        email: String(f[1] || "").trim().toLowerCase(),
        origen: String(f[2] || ""),
      };
    })
    .filter(function (f) {
      return f.email;
    });

  return responderObjeto({ ok: true, total: lista.length, suscriptores: lista });
}

/* ------------------------------------------------------------------ D: especiales */

/*function yaEnviado(tipo, clave) {
  const h = hoja(HOJA_ENVIADOS, ["fecha", "tipo", "clave"]);
  const filas = h.getLastRow() > 1 ? h.getRange(2, 2, h.getLastRow() - 1, 2).getValues() : [];
  return filas.some((f) => String(f[0]) === tipo && String(f[1]) === clave);
}

function marcarEnviado(tipo, clave) {
  hoja(HOJA_ENVIADOS, ["fecha", "tipo", "clave"]).appendRow([new Date(), tipo, clave]);
]

function enviarEspecial(p) {
  if (!claveConfigurada()) return responder(false, "Falta configurar la clave en el script de Google.");
  if (String(p.clave || "") !== CLAVE) return responder(false, "Clave inválida.");

  const slug = String(p.slug || "").trim().slice(0, 160);
  const titulo = String(p.titulo || slug).trim().slice(0, 200);
  const asunto = String(p.asunto || titulo).trim().slice(0, 200);
  const texto = String(p.texto || "").trim().slice(0, 8000);
  if (!slug || !texto) return responder(false, "Faltan datos del especial.");

  if (yaEnviado("especial", slug)) return responder(true, "Ya había sido enviado."); // no repetir

  const lista = suscriptores();
  if (lista.length === 0) return responder(true, "No hay suscriptores todavía.");

  for (const email of lista) {
    MailApp.sendEmail({
      to: email,
      subject: asunto + " · " + titulo,
      body: texto + "\n\n—\nHoracio Marcelo Canteros · argcol.com.ar\n" +
            "Recibís este correo porque te suscribiste al newsletter del sitio.",
    });
  }
  marcarEnviado("especial", slug);
  return responder(true, "Enviado a " + lista.length + " suscriptores.");
}*/

/* ------------------------------------------------------------------ E: aviso diario */

/** Se ejecuta con el disparador diario. Mira el RSS y avisa lo nuevo. */
function revisarNuevos() {
  const rta = UrlFetchApp.fetch(RSS_URL, { muteHttpExceptions: true });
  if (rta.getResponseCode() !== 200) return;

  const items = String(rta.getContentText())
    .split(/<item[\s>]/)
    .slice(1)
    .map((bloque) => {
      const link = (bloque.match(/<link>(?:<!\[CDATA\[)?([^<\]]+)/) || [])[1] || "";
      const titulo = (bloque.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>|<\/title>)/) || [])[1] || "";
      const resumen = (bloque.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>|<\/description>)/) || [])[1] || "";
      return { link: link.trim(), titulo: titulo.trim(), resumen: resumen.trim() };
    })
    .filter((i) => i.link);

  const nuevos = items.filter((i) => !yaEnviado("rss", i.link));
  if (nuevos.length === 0) return;

  const lista = suscriptores();
  if (lista.length === 0) {
    nuevos.forEach((i) => marcarEnviado("rss", i.link)); // igual marcar para no acumular
    return;
  }

  const cuerpo = nuevos.map((i) => "- " + i.titulo + "\n  " + i.link + "\n" + (i.resumen ? "  " + i.resumen.replace(/\s+/g, " ").slice(0, 200) + "…" : "")).join("\n\n");

  for (const email of lista) {
    MailApp.sendEmail({
      to: email,
      subject: nuevos.length === 1 ? "Nueva entrada: " + nuevos[0].titulo : "Nuevas entradas del sitio (" + nuevos.length + ")",
      body: "Novedades en argcol.com.ar\n\n" + cuerpo + "\n\n—\nEquipo Argcol Capital",
    });
  }
  nuevos.forEach((i) => marcarEnviado("rss", i.link));
}

/* ------------------------------------------------------------------ entrada */

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (String(p.accion || "") === "lista") return listarSuscriptores(p);
    if (String(p.accion || "") === "especial") return enviarEspecial(p);
    if (String(p.mensaje || "").trim()) return enviarContacto(p);
    return suscribir(p);
  } catch (err) {
    return responder(false, "Error interno; probar de nuevo.");
  }
}

// Compatibilidad durante el cambio: la página anterior todavía podía pedir
// la lista por GET con la clave en la URL. La página actual ya no lo hace:
// usa POST y la clave no aparece en la dirección ni en el historial.
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (String(p.accion || "") === "lista") return listarSuscriptores(p);
  return responder(true, "servicio argcol ok");
}