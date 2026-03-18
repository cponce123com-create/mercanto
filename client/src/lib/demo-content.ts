export type DemoCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type DemoStore = {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  location: string;
  whatsapp: string;
  total_visits: number;
  is_featured: boolean;
};

export type DemoProduct = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: string;
  offer_price?: string;
  unit?: string;
  image_url: string;
};

export const demoCategories: DemoCategory[] = [
  {
    id: 1,
    name: "Moda y Accesorios",
    slug: "moda-y-accesorios",
    icon: "👕",
    description: "Ropa, calzado, bolsos, joyería y accesorios de uso diario.",
  },
  {
    id: 2,
    name: "Tecnología",
    slug: "tecnologia",
    icon: "💻",
    description: "Celulares, laptops, audífonos y gadgets.",
  },
  {
    id: 3,
    name: "Hogar",
    slug: "hogar",
    icon: "🏠",
    description: "Decoración, cocina, orden y utilidades para casa.",
  },
  {
    id: 4,
    name: "Belleza",
    slug: "belleza",
    icon: "💄",
    description: "Cuidado personal, maquillaje y bienestar.",
  },
  {
    id: 5,
    name: "Mascotas",
    slug: "mascotas",
    icon: "🐾",
    description: "Accesorios, juguetes y productos para mascotas.",
  },
  {
    id: 6,
    name: "Alimentos",
    slug: "alimentos",
    icon: "🛒",
    description: "Productos locales, snacks y canastas especiales.",
  },
];

export const demoStores: DemoStore[] = [
  {
    id: 101,
    name: "Casa Urbana",
    slug: "demo-casa-urbana",
    description: "Productos para hogar, cocina y organización con estilo moderno.",
    logo_url: "https://placehold.co/160x160/F8FAFC/0F172A?text=CU",
    banner_url: "https://placehold.co/1200x500/E2E8F0/0F172A?text=Casa+Urbana",
    location: "San Ramón, Chanchamayo",
    whatsapp: "51999999991",
    total_visits: 328,
    is_featured: true,
  },
  {
    id: 102,
    name: "Moda Viva",
    slug: "demo-moda-viva",
    description: "Ropa casual, accesorios y novedades para toda ocasión.",
    logo_url: "https://placehold.co/160x160/DBEAFE/1D4ED8?text=MV",
    banner_url: "https://placehold.co/1200x500/BFDBFE/1E3A8A?text=Moda+Viva",
    location: "La Merced",
    whatsapp: "51999999992",
    total_visits: 214,
    is_featured: true,
  },
  {
    id: 103,
    name: "Tecno Punto",
    slug: "demo-tecno-punto",
    description: "Accesorios, cargadores, audífonos y gadgets útiles.",
    logo_url: "https://placehold.co/160x160/EDE9FE/5B21B6?text=TP",
    banner_url: "https://placehold.co/1200x500/DDD6FE/4C1D95?text=Tecno+Punto",
    location: "Lima",
    whatsapp: "51999999993",
    total_visits: 487,
    is_featured: false,
  },
  {
    id: 104,
    name: "Pet Feliz",
    slug: "demo-pet-feliz",
    description: "Todo para consentir a tus mascotas con productos bonitos y prácticos.",
    logo_url: "https://placehold.co/160x160/DCFCE7/166534?text=PF",
    banner_url: "https://placehold.co/1200x500/BBF7D0/14532D?text=Pet+Feliz",
    location: "Huancayo",
    whatsapp: "51999999994",
    total_visits: 156,
    is_featured: false,
  },
];

export const demoProducts: DemoProduct[] = [
  {
    id: 1001,
    categoryId: 1,
    name: "Blusa casual premium",
    description: "Diseño cómodo para uso diario con acabado moderno.",
    price: "69.90",
    offer_price: "49.90",
    unit: "unidad",
    image_url: "https://placehold.co/800x600/FCE7F3/9D174D?text=Moda",
  },
  {
    id: 1002,
    categoryId: 1,
    name: "Bolso urbano",
    description: "Bolso versátil para trabajo o salidas.",
    price: "89.90",
    unit: "unidad",
    image_url: "https://placehold.co/800x600/FDF2F8/831843?text=Accesorios",
  },
  {
    id: 1003,
    categoryId: 2,
    name: "Audífonos bluetooth",
    description: "Sonido nítido y batería duradera.",
    price: "129.90",
    offer_price: "99.90",
    unit: "unidad",
    image_url: "https://placehold.co/800x600/EEF2FF/3730A3?text=Tecnologia",
  },
  {
    id: 1004,
    categoryId: 2,
    name: "Soporte para celular",
    description: "Soporte compacto para escritorio y videollamadas.",
    price: "29.90",
    unit: "unidad",
    image_url: "https://placehold.co/800x600/E0E7FF/312E81?text=Gadgets",
  },
  {
    id: 1005,
    categoryId: 3,
    name: "Set organizador de cocina",
    description: "Ideal para mantener orden y estilo en casa.",
    price: "79.90",
    unit: "set",
    image_url: "https://placehold.co/800x600/FEF3C7/92400E?text=Hogar",
  },
  {
    id: 1006,
    categoryId: 4,
    name: "Kit de cuidado personal",
    description: "Presentación bonita para regalo o uso diario.",
    price: "59.90",
    unit: "kit",
    image_url: "https://placehold.co/800x600/FCE7F3/BE185D?text=Belleza",
  },
  {
    id: 1007,
    categoryId: 5,
    name: "Cama acolchada para mascota",
    description: "Suave, cómoda y fácil de limpiar.",
    price: "109.90",
    unit: "unidad",
    image_url: "https://placehold.co/800x600/DCFCE7/166534?text=Mascotas",
  },
  {
    id: 1008,
    categoryId: 6,
    name: "Canasta de snacks locales",
    description: "Selección surtida para regalo o consumo personal.",
    price: "45.00",
    unit: "canasta",
    image_url: "https://placehold.co/800x600/FEF9C3/854D0E?text=Alimentos",
  },
];
