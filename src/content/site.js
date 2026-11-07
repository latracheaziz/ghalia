// Facts below come from the brand book. Phone and email do not appear in either
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
  { to: '/maison', label: { en: 'The Maison', ar: 'الدار' }, image: 'boutique' },
  { to: '/atelier', label: { en: 'The Atelier', ar: 'المشغل' }, image: 'mood-craft' },
  { to: '/collections', label: { en: 'Collections', ar: 'المجموعات' }, image: 'gift-heritage' },
  { to: '/weddings', label: { en: 'Weddings & Events', ar: 'الزفاف والمناسبات' }, image: 'pergola' },
  { to: '/studio', label: { en: '3D Event Studio', ar: 'استوديو المناسبات ثلاثي الأبعاد' }, image: 'pergola-ceremony' },
  { to: '/corporate', label: { en: 'Corporate Gifting', ar: 'هدايا الشركات' }, image: 'national-5' },
  { to: '/order', label: { en: 'Order', ar: 'اطلب الآن' }, image: 'mood-open-box' },
  { to: '/contact', label: { en: 'Contact', ar: 'تواصل معنا' }, image: 'atelier' },
]
