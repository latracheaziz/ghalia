// Descriptions are verbatim from the packaging book. Formats are named from what
// each collection's photography shows; Signature Rose's are stated in its text.

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
    name: { en: 'Standard Classic', ar: 'الكلاسيكية' },
    title: { en: 'GHALIA Standard Classic Collection', ar: 'مجموعة غالية الكلاسيكية' },
    short: { en: 'The core packaging line.', ar: 'خط التغليف الأساسي للدار.' },
    description: {
      en: "This packaging represents the Standard Classic Collection of GHALIA, designed as the brand's core packaging line. It embodies the essence of GHALIA's identity through a timeless, elegant, and sophisticated design while maintaining a strong sense of accessibility and versatility.",
      ar: 'تمثل هذه العبوات مجموعة غالية الكلاسيكية، وقد صُممت لتكون خط التغليف الأساسي للعلامة. تجسد جوهر هوية غالية بتصميم خالد وأنيق وراقٍ، مع الحفاظ على سهولة الوصول إليها وتعدد استخداماتها.',
    },
    theme: { bg: '#EFD9D0', ink: '#44291A', accent: '#7E5133', silk: ['#F4E4DB', '#D9B3A5'] },
    images: ['classic-1', 'classic-6', 'classic-3', 'classic-4', 'classic-5', 'classic-2'],
    formats: [FORMATS.drawer, FORMATS.round, FORMATS.heart, FORMATS.octagon, FORMATS.long, FORMATS.bag],
    fillings,
  },
  {
    slug: 'arabian-heritage',
    group: 'core',
    name: { en: 'Arabian Heritage', ar: 'التراث العربي' },
    title: { en: 'GHALIA Arabian Heritage Collection', ar: 'مجموعة غالية للتراث العربي' },
    short: { en: 'Arabian heritage with contemporary luxury.', ar: 'التراث العربي بفخامة معاصرة.' },
    description: {
      en: "This special packaging collection blends Arabian heritage with contemporary luxury. Inspired by traditional Islamic architecture, geometric patterns, and elegant Arabesque motifs, it reflects GHALIA's cultural identity while maintaining a refined and premium aesthetic. The warm ivory, chocolate-brown, and metallic accents create a sophisticated gifting experience, making the collection ideal for special occasions, festive celebrations, and exclusive luxury editions.",
      ar: 'تمزج هذه المجموعة الخاصة التراث العربي بالفخامة المعاصرة. وهي مستوحاة من العمارة الإسلامية التقليدية والأنماط الهندسية وزخارف الأرابيسك الأنيقة، فتعكس الهوية الثقافية لغالية مع الحفاظ على جمال راقٍ. وتصنع درجات العاجي الدافئ والبني الشوكولاتي واللمسات المعدنية تجربة إهداء راقية، ما يجعلها مثالية للمناسبات الخاصة والاحتفالات والإصدارات الفاخرة الحصرية.',
    },
    theme: { bg: '#E3CDA9', ink: '#3F2716', accent: '#7A4E26', silk: ['#EEDFC4', '#C9A675'] },
    images: ['heritage-2', 'heritage-1', 'heritage-3', 'heritage-4', 'heritage-5', 'gift-heritage'],
    formats: [FORMATS.gift, FORMATS.square, FORMATS.bag],
    fillings,
  },
  {
    slug: 'signature-rose',
    group: 'core',
    name: { en: 'Signature Rose', ar: 'الوردة المميزة' },
    title: { en: 'GHALIA Signature Rose Collection', ar: 'مجموعة غالية الوردة المميزة' },
    short: { en: 'Modern elegance in blush and gold.', ar: 'أناقة عصرية بالوردي والذهبي.' },
    description: {
      en: "This packaging collection embodies modern elegance and timeless luxury through a refined blush-pink color palette enhanced with delicate gold details. Designed as one of GHALIA's signature collections, it combines sophistication, femininity, and premium craftsmanship while maintaining a clean and contemporary aesthetic.",
      ar: 'تجسد هذه المجموعة الأناقة العصرية والفخامة الخالدة عبر درجات وردية راقية تزينها تفاصيل ذهبية رقيقة. صُممت لتكون من المجموعات المميزة لغالية، فتجمع الرقي والأنوثة والحرفية العالية مع جمال نقي ومعاصر.',
    },
    extra: {
      en: 'The soft textured finish, gold foil logo, ribbon details, and coordinated gift bags create a cohesive luxury gifting experience. Available in multiple formats, including round boxes, square gift boxes, and shopping bags, the collection is suitable for chocolates, special occasions, corporate gifts, and exclusive seasonal editions.',
      ar: 'تصنع اللمسة الناعمة وشعار الرقائق الذهبية وتفاصيل الشريط وحقائب الهدايا المتناسقة تجربة إهداء فاخرة ومتكاملة. تتوفر المجموعة بأشكال متعددة، منها العلب الدائرية وعلب الهدايا المربعة وحقائب التسوق، وتناسب الشوكولاتة والمناسبات الخاصة وهدايا الشركات والإصدارات الموسمية الحصرية.',
    },
    theme: { bg: '#E0B7AB', ink: '#3A2115', accent: '#673A28', silk: ['#EFCFC4', '#CF9F92'] },
    images: ['rose-2', 'rose-1', 'mood-rose-box'],
    formats: [FORMATS.round, FORMATS.square, FORMATS.bag],
    fillings,
  },
  {
    slug: 'ramadan',
    group: 'seasonal',
    name: { en: 'Ramadan', ar: 'رمضان' },
    title: { en: 'GHALIA Ramadan Collection', ar: 'مجموعة غالية لرمضان' },
    short: { en: 'A limited edition in royal blue and emerald.', ar: 'إصدار محدود بالأزرق الملكي والزمردي.' },
    description: {
      en: 'A limited-edition packaging collection inspired by the spiritual atmosphere of Ramadan. Featuring rich royal blue and emerald green tones enhanced with intricate gold Islamic patterns, the collection reflects both prestige and tradition. The refined design, premium materials, and exclusive presentation make it ideal for luxury gifting, corporate hampers, and special Ramadan chocolate and date collections.',
      ar: 'مجموعة تغليف بإصدار محدود مستوحاة من الأجواء الروحانية لشهر رمضان. تجمع درجات الأزرق الملكي والأخضر الزمردي الغنية مع زخارف إسلامية ذهبية دقيقة، فتعكس الوجاهة والتقاليد معًا. ويجعلها تصميمها الراقي وخاماتها الممتازة وعرضها الحصري مثالية للهدايا الفاخرة وسلال الشركات ومجموعات رمضان الخاصة من الشوكولاتة والتمور.',
    },
    theme: { bg: '#14306B', ink: '#F6EBD6', accent: '#E0B869', silk: ['#1E4590', '#0E5A4C'] },
    images: ['ramadan-1', 'ramadan-2'],
    formats: [FORMATS.compartment, FORMATS.gift, FORMATS.hamper, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'eid-al-fitr',
    group: 'seasonal',
    name: { en: 'Eid Al Fitr', ar: 'عيد الفطر' },
    title: { en: 'Eid Al Fitr Collection', ar: 'مجموعة عيد الفطر' },
    short: { en: 'The joy of sharing, in warm luxurious tones.', ar: 'بهجة العطاء بدرجات دافئة فاخرة.' },
    description: {
      en: 'A refined Eid Al Fitr packaging collection inspired by Arabian heritage and the spirit of celebration. Featuring elegant arch motifs, intricate patterns, and warm luxurious tones, each piece is thoughtfully crafted to elevate the gifting experience. Blending tradition with contemporary sophistication, the collection embodies generosity, beauty, and the joy of sharing special moments with loved ones.',
      ar: 'مجموعة راقية لعيد الفطر مستوحاة من التراث العربي وروح الاحتفال. تجمع زخارف الأقواس الأنيقة والأنماط الدقيقة والدرجات الدافئة الفاخرة، وقد صُنعت كل قطعة بعناية لترتقي بتجربة الإهداء. وبمزج التقاليد بالرقي المعاصر، تجسد المجموعة الكرم والجمال وبهجة مشاركة اللحظات الخاصة مع الأحبة.',
    },
    theme: { bg: '#8A4E38', ink: '#FFF2E3', accent: '#F3D5A8', silk: ['#A9654A', '#6E3A29'] },
    images: ['fitr-1', 'fitr-2', 'fitr-3', 'fitr-6', 'fitr-4', 'fitr-5', 'fitr-7', 'fitr-8', 'fitr-9', 'fitr-10', 'fitr-11', 'fitr-12'],
    formats: [FORMATS.crescent, FORMATS.arch, FORMATS.octagon, FORMATS.round, FORMATS.cube, FORMATS.tower, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'eid-al-adha',
    group: 'seasonal',
    name: { en: 'Eid Al Adha', ar: 'عيد الأضحى' },
    title: { en: 'Eid Al Adha Collection', ar: 'مجموعة عيد الأضحى' },
    short: { en: 'Generosity and togetherness in ivory and gold.', ar: 'الكرم واللمّة بالعاجي والذهبي.' },
    description: {
      en: 'A sophisticated Eid Al Adha packaging collection that celebrates the essence of generosity and togetherness. Designed in elegant ivory and gold tones, the collection features refined Islamic architectural elements, intricate patterns, and luxurious finishes. Blending timeless heritage with contemporary elegance, each piece is crafted to transform gifting into a memorable and meaningful experience during this special occasion.',
      ar: 'مجموعة راقية لعيد الأضحى تحتفي بجوهر الكرم والتآلف. صُممت بدرجات العاجي والذهبي الأنيقة، وتزينها عناصر معمارية إسلامية رفيعة وأنماط دقيقة ولمسات فاخرة. وبمزج التراث الخالد بالأناقة المعاصرة، صُنعت كل قطعة لتحوّل الإهداء إلى تجربة ذات معنى لا تُنسى في هذه المناسبة الخاصة.',
    },
    theme: { bg: '#EFE3CF', ink: '#44291A', accent: '#7C5A22', silk: ['#F6EEDF', '#D9BF95'] },
    images: ['adha-5', 'adha-1', 'adha-6', 'adha-8', 'adha-3', 'adha-9', 'adha-2', 'adha-4', 'adha-7'],
    formats: [FORMATS.octagon, FORMATS.square, FORMATS.round, FORMATS.cube, FORMATS.arch, FORMATS.bag],
    fillings: [...fillings, dateFilling],
  },
  {
    slug: 'saudi-national-day',
    group: 'seasonal',
    name: { en: 'Saudi National Day', ar: 'اليوم الوطني السعودي' },
    title: { en: 'Saudi National Day Collection', ar: 'مجموعة اليوم الوطني السعودي' },
    short: { en: 'Emerald green and luxurious gold.', ar: 'الأخضر الزمردي والذهبي الفاخر.' },
    description: {
      en: 'Inspired by the pride and heritage of the Kingdom of Saudi Arabia, this exclusive National Day collection features elegant emerald green packaging accented with luxurious gold details. Symbolizing prosperity, unity, and national pride, each piece is thoughtfully crafted to celebrate the spirit of the nation while offering a refined and memorable gifting experience. A perfect blend of contemporary luxury and Saudi identity.',
      ar: 'مستوحاة من فخر المملكة العربية السعودية وتراثها، تتميز هذه المجموعة الحصرية لليوم الوطني بتغليف زمردي أنيق تزينه تفاصيل ذهبية فاخرة. ترمز إلى الازدهار والوحدة والفخر الوطني، وقد صُنعت كل قطعة بعناية لتحتفي بروح الوطن وتقدم تجربة إهداء راقية لا تُنسى. مزيج مثالي من الفخامة المعاصرة والهوية السعودية.',
    },
    theme: { bg: '#0F4A38', ink: '#F6EBD6', accent: '#E0B869', silk: ['#16694F', '#0A3327'] },
    images: ['national-1', 'national-2', 'national-5', 'national-4', 'national-3', 'national-6'],
    formats: [FORMATS.round, FORMATS.gift, FORMATS.long, FORMATS.handle, FORMATS.bag],
    fillings,
  },
]

export const findCollection = (slug) => collections.find((c) => c.slug === slug)
