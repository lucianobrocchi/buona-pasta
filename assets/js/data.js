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
       unit: 'plancha' (se pide de a 1 plancha)  |  'kg' (de a ½ kg)  |  'un' (por unidad)
       perTray:      para 'plancha' — cuántas unidades trae la plancha (dato real, no estimado)
       servesPerTray: para 'plancha' — a cuántas personas le calculamos 1 plancha
                       (estimación nuestra, usada solo por los botones "¿Para cuántos?";
                       ajustala si te parece que sobra o falta)
       price: precio por plancha (o por kg / por unidad, según corresponda) en pesos
       variants: los gustos. Cada uno con su propia foto. Si hay uno solo, no se muestran las opciones.
       veg:   true si ese relleno es vegetariano (se usa en el filtro "Vegetarianas" del menú)
     --------------------------------------------------------------------- */
  products: [
    {
      id: 'ravioles',
      name: 'Ravioles',
      unit: 'plancha',
      perTray: 30,
      servesPerTray: 3,
      size: 'lg',
      blurb: 'Los clásicos de siempre, más chicos que el sorrentino. Elegí el relleno que más te guste.',
      cook: '4 a 6 min',
      variants: [
        {
          id: 'jyq', name: 'Jamón y queso', price: 7000, color: '#E7A5A0', veg: false,
          image: { file: 'ravioles-jyq', sizes: [720, 1200], w: 1200, h: 960, color: '#cc9375', alt: 'Ravioles de jamón y queso con salsa de tomate y perejil' },
        },
        {
          id: 'verdura', name: 'Verdura', price: 7000, color: '#7BA34A', veg: true,
          image: { file: 'ravioles-verdura', sizes: [720, 1200], w: 1200, h: 960, color: '#8c8465', alt: 'Ravioles de verdura con salsa pesto y pistacho' },
        },
        {
          id: '4quesos', name: '4 quesos', price: 7000, color: '#F1C24F', veg: true,
          image: { file: 'ravioles-4quesos', sizes: [720, 1200], w: 1200, h: 960, color: '#916354', alt: 'Ravioles de 4 quesos con salsa de tomate y mucho queso rallado' },
        },
        {
          id: 'ricota', name: 'Ricota', price: 7000, color: '#EFE6CF', veg: true,
          image: { file: 'ravioles-ricota', sizes: [720, 1200], w: 1200, h: 960, color: '#b7b29b', alt: 'Raviol de ricota servido de forma elegante sobre crema' },
        },
      ],
    },
    {
      id: 'sorrentinos',
      name: 'Sorrentinos',
      unit: 'plancha',
      perTray: 12,
      servesPerTray: 2,
      size: 'lg',
      blurb: 'Grandes, redondos y bien rellenos.',
      cook: '5 a 7 min',
      variants: [
        {
          id: 'jyq', name: 'Jamón y queso', price: 7500, color: '#E7A5A0', veg: false,
          image: { file: 'sorrentinos-jyq', sizes: [720, 1200], w: 1200, h: 960, color: '#b9a596', alt: 'Sorrentinos de jamón y queso con salsa de tomate, queso rallado y perejil' },
        },
        {
          id: 'calabaza', name: 'Calabaza y queso', price: 7500, color: '#EE9B3C', veg: true,
          image: { file: 'sorrentinos-calabaza', sizes: [720, 1200], w: 1200, h: 960, color: '#917c5b', alt: 'Sorrentinos de calabaza y queso en caldo con crema y hierbas' },
        },
        {
          id: '4quesos', name: '4 quesos', price: 8000, color: '#F1C24F', veg: true,
          image: { file: 'sorrentinos-4quesos', sizes: [720, 1200], w: 1200, h: 960, color: '#a76550', alt: 'Sorrentinos de 4 quesos con salsa de tomate y mucho queso rallado' },
        },
        {
          id: 'jamon-cheddar', name: 'Jamón y cheddar', price: 8000, color: '#F08A3A', veg: false,
          image: { file: 'sorrentinos-jamon-cheddar', sizes: [720, 1200], w: 1200, h: 960, color: '#ac691f', alt: 'Sorrentinos de jamón y cheddar en salsa cremosa color naranja' },
        },
      ],
    },
    {
      id: 'raviolones',
      name: 'Raviolones de verdura',
      unit: 'plancha',
      perTray: 12,
      servesPerTray: 2,
      size: 'md',
      blurb: 'Un raviol más grande para una porción más generosa.',
      cook: '6 a 8 min',
      variants: [
        {
          id: 'verdura', name: 'Verdura', price: 7500, veg: true,
          image: { file: 'raviolones', sizes: [480, 800], w: 800, h: 800, color: '#aba696', alt: 'Raviolones de verdura con queso en un plato de porcelana azul y blanca' },
        },
      ],
    },
    {
      id: 'noquis',
      name: 'Ñoquis',
      unit: 'kg',
      size: 'md',
      blurb: 'Suaves, esponjosos y listos en minutos. Van con cualquier salsa.',
      cook: '2 a 3 min',
      variants: [
        {
          id: 'clasicos', name: 'Clásicos', price: 8000, veg: true,
          image: { file: 'noquis', sizes: [480, 800], w: 800, h: 800, color: '#b0987b', alt: 'Ñoquis dorados con queso rallado sobre un plato' },
        },
      ],
    },
    {
      id: 'canelones',
      name: 'Canelones',
      unit: 'un',
      size: 'md',
      blurb: 'Se piden por unidad. Al horno con salsa y queso y listo.',
      cook: 'Horno 15 a 20 min',
      // ⚠️ No me dijiste el relleno de los canelones, así que los dejé afuera del filtro
      // "Vegetarianas" (veg: false) para no marcar mal algo que puede llevar carne.
      // Si son de verdura/ricota, cambiá esto a veg: true.
      variants: [
        {
          id: 'caseros', name: 'Caseros', price: 3500, veg: false,
          image: { file: 'canelones', sizes: [480, 800], w: 800, h: 800, color: '#b3a59f', alt: 'Canelones cubiertos de salsa de tomate en un plato blanco' },
        },
      ],
    },
  ],
};
