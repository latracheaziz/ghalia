// Names and descriptions are from the website copy ("Our Collections"). Formats are named from what
// each collection's photography shows.

const f = (id, en, ar) => ({ id, label: { en, ar } })

const FORMATS = {
  round: f('round-box', 'Round box', 'علبة دائرية'),
  square: f('square-box', 'Square gift box', 'علبة هدايا مربعة'),
  drawer: f('drawer-box', 'Drawer box', 'علبة بأدراج'),
  heart: f('heart-box', 'Heart box', 'علبة على شكل قلب'),
  octagon: f('octagon-box', 'Octagon box', 'علبة مثمنة'),
  long: f('long-box', 'Long box', 'علبة طولية'),
  crescent: f('crescent-box', 'Crescent box', 'علبة على شكل هلال'),
  arch: f('arch-box', 'Arch box', 'علبة على شكل قوس'),
  tower: f('tower-box', 'Tower box', 'علبة برجية'),
  cube: f('cube-box', 'Cube box', 'علبة مكعبة'),
  gift: f('gift-box', 'Gift box', 'علبة هدايا'),
  compartment: f('compartment-box', 'Compartment box', 'علبة بأقسام'),
  hamper: f('hamper', 'Corporate hamper', 'سلة هدايا للشركات'),
  handle: f('handle-box', 'Handle box', 'علبة بمقبض'),
  bag: f('shopping-bag', 'Shopping bag', 'حقيبة تسوق'),
}

export const fillings = [
  { id: 'chocolates', label: { en: 'Chocolates', ar: 'شوكولاتة' } },
  { id: 'pralines', label: { en: 'Handcrafted pralines', ar: 'برالين مصنوع يدويًا' } },
  { id: 'pastries', label: { en: 'Chocolates & pastries', ar: 'شوكولاتة وحلويات' } },
]
export const dateFilling = { id: 'dates', label: { en: 'Chocolates & dates', ar: 'شوكولاتة وتمور' } }

export const collections = [
  {
    slug: 'standard-classic',
    group: 'core',
    name: { en: 'Classic Collection', ar: 'المجموعة الكلاسيكية' },
    title: { en: 'Classic Collection', ar: 'المجموعة الكلاسيكية' },
    description: { en: 'Timeless, versatile designs for elegant gifting on any occasion.', ar: 'تصاميم كلاسيكية أنيقة ومتنوعة، لمسة راقية لمختلف المناسبات.' },
    theme: { bg: '#EFD9D0', ink: '#44291A', accent: '#7E5133', silk: ['#F4E4DB', '#D9B3A5'] },
    images: ['classic-1', 'classic-6', 'classic-3', 'classic-4', 'classic-5', 'classic-2'],
    formats: [FORMATS.drawer, FORMATS.round, FORMATS.heart, FORMATS.octagon, FORMATS.long, FORMATS.bag],
    fillings,
  },
  {
    slug: 'arabian-heritage',
    group: 'core',
    name: { en: 'Arabian Heritage Collection', ar: 'مجموعة التراث العربي' },
    title: { en: 'Arabian Heritage Collection', ar: 'مجموعة التراث العربي' },
    description: { en: 'Traditional artistry and Arabian architectural details reimagined with contemporary luxury.', ar: 'تفاصيل مستوحاة من العمارة العربية والفنون التقليدية، برؤية معاصرة تعكس فخامة التراث وأصالته.' },
    theme: { bg: '#E3CDA9', ink: '#3F2716', accent: '#7A4E26', silk: ['#EEDFC4', '#C9A675'] },
    images: ['heritage-2', 'heritage-1', 'heritage-3', 'heritage-4', 'heritage-5', 'gift-heritage'],
    formats: [FORMATS.gift, FORMATS.square, FORMATS.bag],
    fillings,
  },
  {
    slug: 'signature-rose',
    group: 'core',
    name: { en: 'Signature Rose Collection', ar: 'مجموعة الورود' },
    title: { en: 'Signature Rose Collection', ar: 'مجموعة الورود' },
    description: { en: 'Soft blush tones and delicate gold accents for elegant gifting.', ar: 'درجات وردية ناعمة وتفاصيل ذهبية رقيقة، تنسج لمسات نابضة بالأناقة.' },
    theme: { bg: '#E0B7AB', ink: '#3A2115', accent: '#673A28', silk: ['#EFCFC4', '#CF9F92'] },
    images: ['rose-2', 'rose-1', 'mood-rose-box'],
    formats: [FORMATS.round, FORMATS.square, FORMATS.bag],
    fillings,
  },
  {
    slug: 'ramadan',
    group: 'seasonal',
    name: { en: 'Ramadan Collection', ar: 'مجموعة رمضان' },
    title: { en: 'Ramadan Collection', ar: 'مجموعة رمضان' },
    description: { en: 'Royal blue, emerald, and gold designs inspired by the spirit of the holy month.', ar: 'تصاميم تستلهم روح الشهر الفضيل، بألوان الأزرق الملكي والأخضر الزمردي والذهبي.' },
    theme: { bg: '#14306B', ink: '#F6EBD6', accent: '#E0B869', silk: ['#1E4590', '#0E5A4C'] },
    images: ['ramadan-1', 'ramadan-2'],
    formats: [FORMATS.compartment, FORMATS.gift, FORMATS.hamper, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'eid-al-fitr',
    group: 'seasonal',
    name: { en: 'Eid Al Fitr Collection', ar: 'مجموعة عيد الفطر' },
    title: { en: 'Eid Al Fitr Collection', ar: 'مجموعة عيد الفطر' },
    description: { en: 'Warm, elegant designs celebrating the joy of sharing.', ar: 'هدايا تحتفي بفرحة العيد وجمال المشاركة، بتصاميم دافئة وتفاصيل راقية.' },
    theme: { bg: '#8A4E38', ink: '#FFF2E3', accent: '#F3D5A8', silk: ['#A9654A', '#6E3A29'] },
    images: ['fitr-1', 'fitr-2', 'fitr-3', 'fitr-6', 'fitr-4', 'fitr-5', 'fitr-7', 'fitr-8', 'fitr-9', 'fitr-10', 'fitr-11', 'fitr-12'],
    formats: [FORMATS.crescent, FORMATS.arch, FORMATS.octagon, FORMATS.round, FORMATS.cube, FORMATS.tower, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'eid-al-adha',
    group: 'seasonal',
    name: { en: 'Eid Al Adha Collection', ar: 'مجموعة عيد الأضحى' },
    title: { en: 'Eid Al Adha Collection', ar: 'مجموعة عيد الأضحى' },
    description: { en: 'Ivory and gold designs inspired by generosity and togetherness.', ar: 'تصاميم بالألوان العاجية والذهبية، مستوحاة من معاني العطاء والألفة.' },
    theme: { bg: '#EFE3CF', ink: '#44291A', accent: '#7C5A22', silk: ['#F6EEDF', '#D9BF95'] },
    images: ['adha-5', 'adha-1', 'adha-6', 'adha-8', 'adha-3', 'adha-9', 'adha-2', 'adha-4', 'adha-7'],
    formats: [FORMATS.octagon, FORMATS.square, FORMATS.round, FORMATS.cube, FORMATS.arch, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'saudi-national-day',
    group: 'seasonal',
    name: { en: 'Saudi National Day Collection', ar: 'مجموعة اليوم الوطني' },
    title: { en: 'Saudi National Day Collection', ar: 'مجموعة اليوم الوطني' },
    description: { en: 'Emerald green and gold designs celebrating Saudi heritage and pride.', ar: 'تصاميم تحتفي بالهوية السعودية، بدرجات الأخضر الزمردي والذهبي.' },
    theme: { bg: '#0F4A38', ink: '#F6EBD6', accent: '#E0B869', silk: ['#16694F', '#0A3327'] },
    images: ['national-1', 'national-2', 'national-5', 'national-4', 'national-3', 'national-6'],
    formats: [FORMATS.round, FORMATS.gift, FORMATS.long, FORMATS.handle, FORMATS.bag],
    fillings,
  },
]

export const findCollection = (slug) => collections.find((c) => c.slug === slug)
