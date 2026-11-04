// Facts below come from the brand book. Contact details do not appear in either
// source document, so they are read from the environment and stay hidden until set.
const env = import.meta.env

export const brand = {
  name: { en: 'GHALIA', ar: 'غالية' },
  descriptor: { en: 'Chocolate Maison | Weddings & Events', ar: 'دار شوكولاتة | حفلات الزفاف والمناسبات' },
  patisserie: { en: 'Chocolate and Patisserie', ar: 'شوكولاتة وحلويات راقية' },
  location: { en: 'Hail, Saudi Arabia', ar: 'حائل، المملكة العربية السعودية' },
  tagline: { en: 'Crafting Luxury, Celebrating Life.', ar: 'نصنع الفخامة، ونحتفي بالحياة.' },
  signature: {
    en: 'Where luxury is crafted and every celebration becomes a masterpiece.',
    ar: 'حيث تُصنع الفخامة، وتغدو كل مناسبة تحفة فنية.',
  },
}

export const contact = {
  phone: env.VITE_CONTACT_PHONE || null,
  email: env.VITE_CONTACT_EMAIL || null,
  whatsapp: env.VITE_CONTACT_WHATSAPP || null,
  instagram: env.VITE_CONTACT_INSTAGRAM || null,
}

export const navigation = [
  { to: '/maison', label: { en: 'The Maison', ar: 'الدار' }, image: 'boutique' },
  { to: '/atelier', label: { en: 'The Atelier', ar: 'المشغل' }, image: 'mood-craft' },
  { to: '/collections', label: { en: 'Collections', ar: 'المجموعات' }, image: 'gift-heritage' },
  { to: '/weddings', label: { en: 'Weddings & Events', ar: 'الزفاف والمناسبات' }, image: 'pergola' },
  { to: '/studio', label: { en: '3D Event Studio', ar: 'استوديو المناسبات ثلاثي الأبعاد' }, image: 'pergola-ceremony' },
  { to: '/corporate', label: { en: 'Corporate Gifting', ar: 'هدايا الشركات' }, image: 'national-5' },
  { to: '/order', label: { en: 'Order', ar: 'اطلب الآن' }, image: 'mood-open-box' },
  { to: '/contact', label: { en: 'Contact', ar: 'تواصل معنا' }, image: 'atelier' },
]
