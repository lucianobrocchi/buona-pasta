# Buona Pasta · sitio web

Sitio para la fábrica de pastas caseras: **menú con precios, carrito y pedido por WhatsApp**.
Es una página estática (HTML + CSS + JS), sin instalación, sin base de datos y sin dependencias.

## Cómo verlo

Hacé doble clic en `index.html` y se abre en el navegador.

Si querés probarlo como si estuviera publicado (recomendado):

```bash
python -m http.server 5173
```

y abrí <http://localhost:5173>.

## Lo que tenés que completar (2 minutos)

Todo está en **`assets/js/data.js`**. Es el único archivo que hace falta tocar.

| Campo | Qué poner |
| --- | --- |
| `whatsapp` | Número que recibe los pedidos, con código de país y sin `+`, espacios ni guiones. Ej. celular de Argentina: `5491123456789` |
| `instagram` | Usuario sin `@` (opcional) |
| `address` | Dirección del local (opcional, aparece en el pie y al elegir “Retiro”) |
| `hours` | Horarios (opcional) |
| `delivery` | Texto sobre envíos (opcional) |
| `payments` | Medios de pago que se ofrecen al hacer el pedido |
| `freeDeliveryFrom` | Monto a partir del cual el envío es gratis (opcional). Con esto puesto, el carrito muestra una barra de progreso cuando alguien elige "Envío". Dejalo en `null` para no mostrar nada. |

Mientras `whatsapp` esté vacío, el carrito muestra un aviso y los botones de WhatsApp se ocultan.

## Cambiar precios, gustos o productos

En el mismo `data.js`, dentro de `products`:

- `price` → precio por kilo (o por unidad, si `unit` es `'un'`).
- `variants` → los gustos. Cada gusto puede tener su propio precio (por eso los sorrentinos cuestan `7500` o `8000` según el gusto).
- `unit` → `'kg'` (se pide de a ½ kg) o `'un'` (por unidad).
- `cook` → tiempo de cocción que se muestra en la tarjeta.
- `veg` (dentro de cada gusto, en `variants`) → `true` si ese relleno es vegetariano. Se usa para el botón
  **"Vegetarianas"** del menú: filtra las tarjetas y, en la que tiene varios gustos, apaga los que no lo son.

> **Revisá estos supuestos**, los cargué a partir de la lista de precios:
> - Los ravioles, sorrentinos y raviolones están cargados **por kilo** (igual que los ñoquis). Si alguno se vende por docena, cambiá `unit` y el texto.
> - “Sorrentinos de 4 quesos y jamón y cheddar a $8.000” se cargó como **dos gustos**: *4 quesos* y *jamón y cheddar*.
> - Los tiempos de cocción y “1 kg ≈ 4 porciones” son orientativos: ajustalos a tu producto.
> - **No me dijiste el relleno de los canelones**, así que quedaron marcados como `veg: false` (no aparecen bajo
>   "Vegetarianas") para no arriesgarme a mostrar mal algo que puede llevar carne. Si son de verdura o ricota, cambiá
>   esa línea a `veg: true` en `data.js`.

## Cambiar las fotos

Las fotos son de stock (ver `CREDITS.md`). Para poner **fotos reales** de tus pastas, reemplazá los archivos de `assets/img/`
manteniendo los nombres y las proporciones (`ravioles-720.webp` y `ravioles-1200.webp`, etc.). Formato recomendado: WebP.

## Publicarlo en internet

Sirve cualquier hosting que aloje archivos estáticos. Subí **toda la carpeta**:

- **Netlify Drop** (netlify.com/drop): arrastrás la carpeta y listo.
- **Vercel**, **Cloudflare Pages** o **GitHub Pages**.
- Un hosting común: subís los archivos por FTP a `public_html`.

Después de publicarlo, en `index.html` reemplazá `https://TU-DOMINIO.com` por tu dirección real
(así se ve la imagen cuando compartís el link por WhatsApp o redes).

## Lo nuevo de esta vuelta

- **Filtro "Vegetarianas"** arriba del menú (junto a "Todos").
- **"¿Para cuántos?"** en cada tarjeta: botones 2 / 4 / 6 que calculan la cantidad solos.
- **"¿Sumás algo más?"** dentro del carrito: sugiere el próximo producto que todavía no pediste.
- **Aviso de envío gratis** en el carrito (si cargaste `freeDeliveryFrom`).
- **Preguntas frecuentes** (congelado, cocción, medios de pago, envíos) — con datos estructurados para buscadores.
- **Se puede "instalar"** como app (botón en el pie, en los navegadores que lo permiten) y funciona un poco mejor con
  conexión inestable gracias a un *service worker* que guarda lo ya visitado.
- Hoja de estilos para **imprimir un menú** limpio (Ctrl/Cmd+P), por si lo querés pegado en el local.

## Animaciones y accesibilidad

- La página respeta la preferencia del sistema “reducir movimiento”. Si está activada, se muestra una versión estática
  con un aviso para **activar las animaciones**; en el pie hay un interruptor para cambiarlo cuando quieras.
- Teclado: todo el menú y el carrito se pueden usar sin mouse.

## Detalles técnicos

- Sin frameworks ni paso de compilación: `index.html`, `assets/css/styles.css`, `assets/js/{data,app,fx}.js`.
- Fuentes (Fraunces y DM Sans) alojadas en el propio sitio: no dependen de Google.
- Imágenes en WebP con `srcset` y carga diferida. Los videos (≈1,6 MB en total) se cargan después de mostrar la página y
  no se descargan con ahorro de datos ni con “reducir movimiento”.
- El pedido se guarda en el navegador (`localStorage`), así no se pierde si se recarga la página.
- `manifest.json` + `sw.js` habilitan que el sitio se pueda instalar. No hace falta tocarlos; si preferís que el sitio
  **no** se pueda instalar ni funcione offline, borrá esos dos archivos y el `<link rel="manifest">` de `index.html`.
- `sitemap.xml` y `robots.txt` también usan `TU-DOMINIO.com` como marcador: actualizalos al publicar (mismo cambio
  que la imagen para compartir).
