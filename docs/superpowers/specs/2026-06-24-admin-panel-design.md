# Panel de administración (`/admin`) — diseño

## Contexto

La web de Izquierdo Seguros es hoy un sitio Next.js 100% estático (`output: 'export'`), con todo el contenido (textos, lista de seguros, datos de contacto) hardcodeado en componentes/`constants.ts`, desplegado en Vercel y versionado en `github.com/franci8319/izquierdo-seguros`. La familia Izquierdo (no técnica) quiere poder cambiar textos, imágenes, añadir/editar/eliminar tipos de seguro, y publicar avisos puntuales (ej. "Nuevo horario de verano") sin depender de un desarrollador para cada cambio.

El login debe ser deliberadamente simple: una única contraseña compartida (no cuentas individuales, no login con GitHub), con recuperación de contraseña por email a una dirección fija que no debe exponerse en ningún punto del sitio público.

## Decisión de arquitectura

Se descartan CMS de terceros tipo Decap CMS o TinaCMS: ambos están diseñados alrededor de login con GitHub o servicios de identidad propios (TinaCloud), y forzar un esquema de "contraseña única + recuperación a email fijo" sobre esas herramientas sería ir a contracorriente de su diseño. Se construye un **panel a medida**, integrado en el mismo proyecto Next.js.

Esto implica abandonar `output: 'export'`: el sitio pasa a un modelo híbrido donde las páginas públicas siguen siendo estáticas/rápidas, pero `/admin` y las rutas de API que necesita corren como funciones serverless de Vercel (soportado de forma nativa, sin coste adicional relevante a este volumen de tráfico).

Pieza nueva de infraestructura: **Vercel KV** (almacén clave-valor gratuito en el mismo proyecto Vercel), usado solo para:
- El hash de la contraseña actual del panel.
- Tokens de recuperación de contraseña (de un solo uso, con expiración).
- Contadores simples de rate-limiting para login y recuperación.

No se introduce ninguna otra base de datos. El contenido editable sigue viviendo como un fichero JSON dentro del propio repo de git (igual filosofía que ahora, solo que centralizado).

## Modelo de contenido — `content/site.json`

Un único fichero JSON en el repo, importado directamente por las páginas públicas (sin fetch en runtime — cualquier cambio ya dispara un redeploy, así que el contenido estático se sigue generando en build):

```json
{
  "hero": { "eyebrow": "", "title": "", "subtitle": "" },
  "aboutUs": {
    "eyebrow": "", "heading": "",
    "paragraphs": ["", "", ""],
    "stats": [{ "icon": "iconKey", "label": "" }]
  },
  "whyChooseUs": {
    "heading": "",
    "cards": [{ "icon": "iconKey", "title": "", "description": "" }]
  },
  "seguros": [{ "id": "slug", "title": "", "description": "", "icon": "iconKey" }],
  "contact": {
    "phoneLandline": "", "phoneMobile": "", "whatsappNumber": "", "address": ""
  },
  "legal": { "razonSocial": "", "cif": "", "dgsfpNumber": "" },
  "images": { "hero": "/images/hero/...", "about": "/images/about/..." },
  "banner": {
    "enabled": false,
    "text": "",
    "image": null,
    "ctaText": null,
    "ctaHref": null,
    "updatedAt": "ISO-8601"
  }
}
```

`legal` cubre los datos pendientes de la DGSFP/CIF que hoy son un TODO en el footer — así la familia los rellena ella misma cuando los tenga, sin pedírmelo.

El logo y la estructura/diseño general de la página **no** son editables desde el panel.

## Iconos

Los iconos de `seguros` y `whyChooseUs.cards` se eligen de una lista cerrada de ~12-15 iconos predefinidos (extensión del `IconBadge` actual: hogar, auto/moto, vida, salud, decesos, viaje, mascotas, negocio/comercio, ahorro, jubilación, responsabilidad civil, comunidades, embarcaciones, ciclomotor, genérico/estrella). El panel muestra un selector visual (grid de iconos), nunca subida libre de icono — mantiene consistencia visual con el resto de la web.

## Autenticación y recuperación de contraseña

- `POST /api/admin/login` recibe la contraseña, la compara contra el hash guardado en Vercel KV (`admin:passwordHash`). Si coincide, emite una cookie de sesión firmada (httpOnly, secure, expiración ~7 días).
- Middleware de Next.js protege todo `/admin/**` excepto `/admin/login` y `/admin/reset`: sin cookie válida, redirige a `/admin/login`.
- `POST /api/admin/forgot-password`: genera un token aleatorio de un solo uso, lo guarda en KV con expiración corta (~30 min), y envía (vía Resend) un email con el enlace de recuperación a la dirección fija guardada en la variable de entorno `RECOVERY_EMAIL` — esa dirección no se referencia en ningún texto ni código visible del lado cliente.
- `/admin/reset?token=...`: valida el token contra KV (existe, no caducado, no usado); si es válido, permite fijar una nueva contraseña (se hashea y reemplaza `admin:passwordHash`; el token se invalida).
- Rate-limiting básico (contador en KV por IP) en login y en forgot-password para mitigar fuerza bruta.
- La contraseña inicial se fija al desplegar esta feature; se recomienda una contraseña inicial robusta (no el nombre del negocio), cambiable desde el propio panel en cualquier momento.

## Guardado de contenido (commits a GitHub)

- `GET /api/admin/content` (requiere sesión): lee `content/site.json` en vivo desde la API de GitHub (Contents API), devolviendo el JSON parseado junto con su `sha` actual.
- `POST /api/admin/content` (requiere sesión): recibe el JSON editado + el `sha` previo, y hace `PUT` a la Contents API de GitHub para commitear el cambio, usando ese `sha` para concurrencia optimista. Si el `sha` no coincide (alguien guardó otro cambio mientras se editaba), devuelve un error explícito en vez de sobrescribir.
- Ese commit dispara el redeploy automático que ya existe en la integración GitHub → Vercel. El panel avisa de que el cambio tardará ~30-60 segundos en verse en la web pública.
- `POST /api/admin/upload-image` (requiere sesión): recibe un fichero, lo commitea como nuevo archivo en `public/images/uploads/<timestamp>-<nombre>` vía la misma Contents API, y devuelve la ruta pública para guardarla en `images.hero` / `images.about` / `banner.image` en el siguiente guardado de contenido.
- Todas las rutas de escritura usan un token de GitHub (fine-grained PAT, permiso `contents: write` limitado a este repo) guardado como variable de entorno en Vercel — nunca expuesto al navegador.

## Banner / aviso emergente

- Sección `banner` en el contenido: `enabled`, `text`, `image` (opcional), `ctaText`/`ctaHref` (opcional), `updatedAt`.
- En la web pública, un componente cliente comprueba al cargar si `banner.enabled` es `true`; si lo es, compara `banner.updatedAt` con el valor guardado en `localStorage` (`izquierdo-banner-seen`). Si no coincide (primera vez, o el aviso cambió desde la última visita), muestra un modal con el texto/imagen/CTA y un botón de cerrar; al cerrarlo, guarda el `updatedAt` actual en `localStorage`.
- Si `banner.enabled` es `false`, el modal nunca aparece — no hace falta vaciar el texto cada vez que deje de ser relevante.
- Editable íntegramente desde el panel (activar/desactivar, texto, imagen opcional, botón opcional).

## Variables de entorno nuevas

- `RECOVERY_EMAIL`: dirección fija (vitoizquierdo@gmail.com) a la que se envían los enlaces de recuperación. Solo en servidor.
- `RESEND_API_KEY`: para el envío de esos emails vía Resend.
- `GITHUB_TOKEN`: fine-grained PAT con permiso `contents: write` limitado al repo `franci8319/izquierdo-seguros`, usado por las rutas de guardado de contenido/imágenes.
- `SESSION_SECRET`: clave para firmar la cookie de sesión del panel.
- Binding de **Vercel KV** en el proyecto (se crea desde el dashboard de Vercel, sin coste en este volumen).

## Manejo de errores

- Login incorrecto: mensaje genérico "contraseña incorrecta", sin pistas adicionales, sujeto a rate-limit.
- Fallo de red/API al guardar contenido o subir imagen: error visible en el panel, sin perder lo que se estaba editando (no se resetea el formulario).
- Conflicto de `sha` al guardar: aviso claro de que hay una versión más reciente, con opción de recargar antes de reintentar.

## Fuera de alcance (explícito)

- No hay cuentas individuales ni roles — contraseña única compartida, por decisión expresa.
- No hay editor de texto enriquecido (WYSIWYG) — los campos son texto plano/párrafos simples en inputs y textareas.
- No hay multi-idioma.
- No hay modo borrador/preview — guardar publica directamente (con el retraso de redeploy ya mencionado).
- No hay recorte/edición de imágenes en el navegador — se usan tal cual se suben.
- El logo y la estructura/diseño general de la página no son editables desde el panel.
- No se monta una suite de tests automatizados general para este panel, dado el tamaño del proyecto (web de una sola página); se hacen pruebas manuales dirigidas (ver Verificación). Si el panel crece en el futuro, esto debería revisarse.

## Verificación

Pruebas manuales a realizar tras la implementación:
1. Login correcto e incorrecto; comprobar que el rate-limit se activa tras varios intentos fallidos.
2. Flujo completo de "olvidé mi contraseña": recepción real del email en `vitoizquierdo@gmail.com`, validez del enlace, caducidad tras el tiempo configurado, cambio de contraseña efectivo.
3. Editar cada sección de contenido (hero, sobre nosotros, por qué elegirnos, seguros, contacto, legal) y confirmar que el cambio se refleja en la web pública tras el redeploy.
4. Añadir y eliminar un seguro, incluyendo selección de icono.
5. Subir una imagen nueva para el hero y para "sobre nosotros".
6. Activar el banner, comprobar que aparece una vez por visitante (perfil de navegador limpio) y no se repite; editarlo y comprobar que vuelve a aparecer; desactivarlo y comprobar que deja de mostrarse.
7. Confirmar que ninguna ruta de escritura funciona sin sesión válida (probar llamando a las APIs directamente sin cookie).
