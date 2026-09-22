/* =====================================================================
   BUONA PASTA · datos del negocio y del menú
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para cambiar precios,
   sabores, número de WhatsApp, etc. Guardá y recargá la página.
   ===================================================================== */
window.BUONA = {
  business: {
    name: 'Buona Pasta',

    // WhatsApp que recibe los pedidos. Con código de país, sin "+", sin
    // espacios ni guiones. Ejemplo (celular de Argentina): 5491123456789
    whatsapp: '',

    instagram: '', // usuario sin @ (ej: 'buonapasta'). Vacío = no se muestra
    address: '',   // ej: 'Av. Corrientes 1234, CABA'. Vacío = no se muestra
    hours: '',     // ej: 'Lunes a sábado de 9 a 20 hs'. Vacío = no se muestra
    delivery: '',  // ej: 'Envíos en el día dentro de la zona.' Vacío = texto genérico

    // Medios de pago que aparecen al hacer el pedido
    payments: ['Efectivo', 'Transferencia', 'Mercado Pago'],

    // A partir de qué total (en $) el envío es gratis. null = no se muestra el aviso.
    // Ejemplo: freeDeliveryFrom: 15000,
    freeDeliveryFrom: null,
  },

  /* ---------------------------------------------------------------------
     Productos.
       unit:  'kg' (se pide de a ½ kg)  |  'un' (se pide por unidad)
       price: precio por kg (o por unidad) en pesos
       variants: los gustos. Si hay uno solo, no se muestran las opciones.
       veg:   true si ese relleno es vegetariano (se usa en el filtro "Vegetarianas" del menú)
     --------------------------------------------------------------------- */
  products: [
    {
      id: 'ravioles',
      name: 'Ravioles',
      unit: 'kg',
      size: 'lg',
      blurb: 'Los clásicos de siempre. Elegí el relleno que más te guste.',
      cook: '4 a 6 min',
      image: {
        file: 'ravioles', sizes: [720, 1200], w: 1200, h: 960, color: '#cc9375',
        alt: 'Ravioles con salsa de tomate y perejil sobre una fuente blanca',
      },
      variants: [
        { id: 'jyq',     name: 'Jamón y queso', price: 7000, color: '#E7A5A0', veg: false },
        { id: 'verdura', name: 'Verdura',       price: 7000, color: '#7BA34A', veg: true },
        { id: '4quesos', name: '4 quesos',      price: 7000, color: '#F1C24F', veg: true },
        { id: 'ricota',  name: 'Ricota',        price: 7000, color: '#EFE6CF', veg: true },
      ],
    },
    {
      id: 'sorrentinos',
      name: 'Sorrentinos',
      unit: 'kg',
      size: 'lg',
      blurb: 'Grandes, redondos y bien rellenos.',
      cook: '5 a 7 min',
      image: {
        file: 'sorrentinos', sizes: [720, 1200], w: 1200, h: 960, color: '#b9a596',
        alt: 'Sorrentinos con salsa de tomate, queso rallado y perejil en un plato hondo',
      },
      variants: [
        { id: 'jyq',           name: 'Jamón y queso',    price: 7500, color: '#E7A5A0', veg: false },
        { id: 'calabaza',      name: 'Calabaza y queso', price: 7500, color: '#EE9B3C', veg: true },
        { id: '4quesos',       name: '4 quesos',         price: 8000, color: '#F1C24F', veg: true },
        { id: 'jamon-cheddar', name: 'Jamón y cheddar',  price: 8000, color: '#F08A3A', veg: false },
      ],
    },
    {
      id: 'raviolones',
      name: 'Raviolones de verdura',
      unit: 'kg',
      size: 'md',
      blurb: 'Un raviol más grande para una porción más generosa.',
      cook: '6 a 8 min',
      image: {
        file: 'raviolones', sizes: [480, 800], w: 800, h: 800, color: '#aba696',
        alt: 'Raviolones de verdura con queso en un plato de porcelana azul y blanca',
      },
      variants: [{ id: 'verdura', name: 'Verdura', price: 7500, veg: true }],
    },
    {
      id: 'noquis',
      name: 'Ñoquis',
      unit: 'kg',
      size: 'md',
      blurb: 'Suaves, esponjosos y listos en minutos. Van con cualquier salsa.',
      cook: '2 a 3 min',
      image: {
        file: 'noquis', sizes: [480, 800], w: 800, h: 800, color: '#b0987b',
        alt: 'Ñoquis dorados con queso rallado sobre un plato',
      },
      variants: [{ id: 'clasicos', name: 'Clásicos', price: 8000, veg: true }],
    },
    {
      id: 'canelones',
      name: 'Canelones',
      unit: 'un',
      size: 'md',
      blurb: 'Se piden por unidad. Al horno con salsa y queso y listo.',
      cook: 'Horno 15 a 20 min',
      image: {
        file: 'canelones', sizes: [480, 800], w: 800, h: 800, color: '#b3a59f',
        alt: 'Canelones cubiertos de salsa de tomate en un plato blanco',
      },
      // ⚠️ No me dijiste el relleno de los canelones, así que los dejé afuera del filtro
      // "Vegetarianas" (veg: false) para no marcar mal algo que puede llevar carne.
      // Si son de verdura/ricota, cambiá esto a veg: true.
      variants: [{ id: 'caseros', name: 'Caseros', price: 3500, veg: false }],
    },
  ],
};
