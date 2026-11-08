// Copy follows "Ghalia: Website Copy" (Nov 2026). Its contact table gives an email but
// no phone, so the phone is read from the environment and stays hidden until set.
const env = import.meta.env

export const brand = {
  name: { en: 'GHALIA', ar: 'غالية' },
  descriptor: { en: 'Luxury Chocolate and Patisserie', ar: 'دار للشوكولاتة والحلا والحلويات الفاخرة' },
  location: { en: 'Hail, Saudi Arabia', ar: 'حائل، المملكة العربية السعودية' },
  tagline: { en: 'Crafting luxury. Creating emotions. Celebrating life.', ar: 'نسوي حلى مميز، ونصنع المشاعر، ونحتفل بالحياة.' },
  footerTagline: {
    en: 'Ghalia Chocolate and Patisserie. Crafting luxury. Creating emotions. Celebrating life.',
    ar: 'غالية للشوكولاتة والحلا والحلويات. نصنع الفخامة، ونصنع المشاعر، ونحتفل بالحياة.',
  },
  footerDescription: {
    en: 'A Luxury Chocolate and Patisserie in Saudi Arabia, creating handcrafted chocolates, refined pastries, bespoke gifts and unforgettable celebrations.',
    ar: 'دار للشوكولاتة والحلا والحلويات الفاخرة في المملكة العربية السعودية، تصنع شوكولاتة باليد وحلويات راقية وهدايا مفصّلة واحتفالات ما تنسى.',
  },
}

export const contact = {
  phone: env.VITE_CONTACT_PHONE || null,
  email: env.VITE_CONTACT_EMAIL || 'ghalia@natheelco.com',
}

// The Maison's own accounts, as supplied by the Maison. An entry without a url
// stays hidden: Facebook is listed but has no address yet.
export const social = [
  { id: 'instagram', name: { en: 'Instagram', ar: 'إنستغرام' }, handle: '@gh.alia415', url: 'https://www.instagram.com/gh.alia415', action: { en: 'Follow the atelier', ar: 'تابعوا المشغل' } },
  { id: 'whatsapp', name: { en: 'WhatsApp', ar: 'واتساب' }, handle: '+966 54 342 2132', url: 'https://wa.me/966543422132', action: { en: 'Write to the Maison', ar: 'راسلوا الدار' } },
  { id: 'youtube', name: { en: 'YouTube', ar: 'يوتيوب' }, handle: '@GhaliaInfo', url: 'https://www.youtube.com/@GhaliaInfo', action: { en: 'Watch', ar: 'شاهدوا' } },
  { id: 'threads', name: { en: 'Threads', ar: 'ثريدز' }, handle: '@gh.alia415', url: 'https://www.threads.com/@gh.alia415', action: { en: 'Join the conversation', ar: 'شاركوا الحديث' } },
  { id: 'facebook', name: { en: 'Facebook', ar: 'فيسبوك' }, handle: null, url: null, action: { en: 'Follow', ar: 'تابعوا' } },
  { id: 'snapchat', name: { en: 'Snapchat', ar: 'سناب شات' }, handle: '@ghaliainfo', url: 'https://www.snapchat.com/@ghaliainfo', action: { en: 'Follow', ar: 'تابعوا' } },
  { id: 'linktree', name: { en: 'Linktree', ar: 'لينكتري' }, handle: 'linktr.ee/Ghali.A', url: 'https://linktr.ee/Ghali.A', action: { en: 'Every link in one place', ar: 'كل الروابط في مكان واحد' } },
].filter((account) => account.url)

export const navigation = [
  { to: '/maison', label: { en: 'Our Story', ar: 'قصتنا' }, image: 'boutique-salon' },
  { to: '/atelier', label: { en: 'The Atelier', ar: 'المشغل' }, image: 'mood-craft' },
  { to: '/collections', label: { en: 'Collections and Gifting', ar: 'المجموعات والإهداء' }, image: 'gift-heritage' },
  { to: '/weddings', label: { en: 'Weddings and Events', ar: 'الأعراس والمناسبات' }, image: 'pergola' },
  { to: '/studio', label: { en: '3D Event Studio', ar: 'استوديو المناسبات ثلاثي الأبعاد' }, image: 'pergola-ceremony' },
  { to: '/corporate', label: { en: 'Corporate Gifting', ar: 'هدايا الشركات' }, image: 'national-5' },
  { to: '/order', label: { en: 'Order', ar: 'اطلب الآن' }, image: 'mood-open-box' },
  { to: '/contact', label: { en: 'Contact', ar: 'تواصل معنا' }, image: 'boutique-front' },
]
