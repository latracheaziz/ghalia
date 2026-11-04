// "Our Expertise" from the brand book, each routed to where it lives on the site.
export const expertise = [
  { name: { en: 'Premium Handcrafted Chocolates', ar: 'شوكولاتة راقية مصنوعة يدويًا' }, to: '/atelier', hash: 'chocolates', image: 'mood-craft' },
  { name: { en: 'Luxury Pastries & Desserts', ar: 'حلويات وتحليات فاخرة' }, to: '/atelier', hash: 'pastries', image: 'classic-3' },
  { name: { en: 'Signature Chocolate Trays', ar: 'صواني شوكولاتة مميزة' }, to: '/atelier', hash: 'halo', image: 'halo-tray' },
  { name: { en: 'Bespoke Gift Collections', ar: 'مجموعات هدايا مصممة خصيصًا' }, to: '/collections', image: 'gift-heritage' },
  { name: { en: 'Wedding & Event Planning', ar: 'تخطيط الزفاف والمناسبات' }, to: '/weddings', image: 'mood-arch' },
  { name: { en: '3D Event Concept Design', ar: 'تصميم مفاهيم المناسبات ثلاثي الأبعاد' }, to: '/studio', image: 'pergola-ceremony' },
  { name: { en: 'Corporate Gifting Solutions', ar: 'حلول هدايا الشركات' }, to: '/corporate', image: 'national-5' },
  { name: { en: 'Luxury Catering Experiences', ar: 'تجارب ضيافة فاخرة' }, to: '/weddings', hash: 'catering', image: 'hosts' },
]

// "Concept 01" sheet from the brand book.
export const haloTray = {
  label: { en: 'Concept 01', ar: 'المفهوم 01' },
  name: { en: 'The Halo Tray', ar: 'صينية الهالة' },
  kind: { en: 'Event Presentation Tray · Wedding & Luxury Events', ar: 'صينية عرض للمناسبات · الزفاف والمناسبات الفاخرة' },
  intro: {
    en: 'A statement tray designed to elevate every celebration with elegance and sophistication.',
    ar: 'صينية لافتة صُممت لترتقي بكل مناسبة بأناقة ورقي.',
  },
  features: [
    { en: 'Elegant halo arches inspired by timeless architecture.', ar: 'أقواس هالة أنيقة مستوحاة من العمارة الخالدة.' },
    { en: 'Sophisticated combination of blush, mocha and gold.', ar: 'مزيج راقٍ من الوردي والموكا والذهبي.' },
    { en: 'Custom floral arrangements to match the event theme.', ar: 'تنسيقات زهور مخصصة تناسب طابع المناسبة.' },
    { en: 'Ideal for weddings, VIP events and luxury celebrations.', ar: 'مثالية لحفلات الزفاف ومناسبات كبار الضيوف والاحتفالات الفاخرة.' },
  ],
  materials: [
    { id: 'acrylic', name: { en: 'Acrylic', ar: 'أكريليك' } },
    { id: 'steel', name: { en: 'Stainless Steel Gold Finish', ar: 'ستانلس ستيل بلمسة ذهبية' } },
    { id: 'leather', name: { en: 'Leather Texture', ar: 'ملمس جلدي' } },
    { id: 'flowers', name: { en: 'Fresh Flowers', ar: 'زهور طبيعية' } },
  ],
  width: { en: '60 cm', ar: '60 سم' },
  height: { en: '55 cm', ar: '55 سم' },
  capacity: { en: 'Approx. 80 – 120 pieces (Chocolates & Pastries)', ar: 'نحو 80 إلى 120 قطعة (شوكولاتة وحلويات)' },
  signoff: { en: 'Crafted for unforgettable celebrations', ar: 'صُنعت لاحتفالات لا تُنسى' },
}

// French concept board in the brand book, carried into English and Arabic.
export const pergola = {
  name: { en: 'GHALIA de Chocolat', ar: 'غالية دو شوكولا' },
  kind: { en: 'Pergola Event & Wedding Concept', ar: 'مفهوم البرجولة للمناسبات والزفاف' },
  intro: {
    en: 'An elegant pergola where chocolate meets the art of celebration. A space imagined to enchant, create memories, and elevate every event.',
    ar: 'برجولة أنيقة يلتقي فيها الشوكولاتة بفن الاحتفال. فضاء صُمم ليسحر ويصنع الذكريات ويرتقي بكل مناسبة.',
  },
  zones: [
    { name: { en: 'Chocolate Arch Photo Spot', ar: 'قوس الشوكولاتة للتصوير' }, image: 'pergola-arch' },
    { name: { en: 'Ceiling Detail', ar: 'تفاصيل السقف' }, image: 'pergola-ceiling' },
    { name: { en: 'Intimate Ceremony Space', ar: 'مساحة الحفل الخاصة' }, image: 'pergola-ceremony' },
    { name: { en: 'Decoration Detail', ar: 'تفاصيل الديكور' }, image: 'pergola-decor' },
    { name: { en: 'Lounge & Reception Space', ar: 'مساحة الجلوس والاستقبال' }, image: 'pergola-lounge' },
  ],
  qualities: [
    { en: 'Customizable for all types of events', ar: 'قابلة للتخصيص لجميع أنواع المناسبات' },
    { en: 'Warm and romantic atmosphere', ar: 'أجواء دافئة ورومانسية' },
    { en: 'Noble materials: wood, metal, fabrics, flowers', ar: 'خامات نبيلة: خشب ومعدن وأقمشة وزهور' },
    { en: 'Ideal for photos and Instagram content', ar: 'مثالية للصور ومحتوى إنستغرام' },
  ],
}

// The journey the brand book describes, from first consultation to final celebration.
export const journey = [
  { title: { en: 'The first consultation', ar: 'الاستشارة الأولى' }, text: { en: "Your personality and aspirations, heard by our in-house Wedding Planner.", ar: 'يستمع مخطط الزفاف في الدار إلى شخصيتكم وتطلعاتكم.' } },
  { title: { en: 'Creative concept', ar: 'ابتكار المفهوم' }, text: { en: 'Our Creative Design Team develops an original concept for your celebration.', ar: 'يطور فريق التصميم الإبداعي مفهومًا أصيلًا لمناسبتكم.' } },
  { title: { en: '3D visualization', ar: 'التصور ثلاثي الأبعاد' }, text: { en: 'See your entire event through immersive 3D concepts before it comes to life.', ar: 'شاهدوا مناسبتكم كاملة عبر مفاهيم غامرة ثلاثية الأبعاد قبل تنفيذها.' } },
  { title: { en: 'Flawless execution', ar: 'التنفيذ المتقن' }, text: { en: 'Every product, tray, dessert, and decorative element, designed in-house.', ar: 'كل منتج وصينية وحلوى وعنصر زخرفي يُصمَّم داخل الدار.' } },
  { title: { en: 'The final celebration', ar: 'الاحتفال الختامي' }, text: { en: 'A timeless experience, and memories that last a lifetime.', ar: 'تجربة خالدة وذكريات تدوم مدى الحياة.' } },
]

// Choices offered by the 3D Event Studio. Palettes use the brand and collection colours.
export const studio = {
  settings: [
    { id: 'halo', label: { en: 'Halo Ceremony', ar: 'حفل الهالة' } },
    { id: 'pergola', label: { en: 'Pergola', ar: 'البرجولة' } },
    { id: 'reception', label: { en: 'Reception Table', ar: 'طاولة الاستقبال' } },
  ],
  palettes: [
    { id: 'blush', label: { en: 'Blush, Mocha & Gold', ar: 'وردي وموكا وذهبي' }, primary: '#D7A894', secondary: '#44291A', floral: ['#E9BFB2', '#F4E2D6', '#D9958A'] },
    { id: 'ivory', label: { en: 'Ivory & Gold', ar: 'عاجي وذهبي' }, primary: '#EBD7BE', secondary: '#BD7D45', floral: ['#F7EFE2', '#EFDCC2', '#E7C9A4'] },
    { id: 'emerald', label: { en: 'Emerald & Gold', ar: 'زمردي وذهبي' }, primary: '#0F4A38', secondary: '#D3A05F', floral: ['#F7EFE2', '#E8D7B8', '#C9D6B8'] },
    { id: 'royal', label: { en: 'Royal Blue & Gold', ar: 'أزرق ملكي وذهبي' }, primary: '#14306B', secondary: '#D3A05F', floral: ['#F7EFE2', '#DCE3F0', '#E8D7B8'] },
  ],
  florals: [
    { id: 'light', label: { en: 'Light', ar: 'خفيفة' }, density: 0.45 },
    { id: 'full', label: { en: 'Full', ar: 'كثيفة' }, density: 1 },
    { id: 'abundant', label: { en: 'Abundant', ar: 'وفيرة' }, density: 1.6 },
  ],
  moods: [
    { id: 'golden', label: { en: 'Golden Hour', ar: 'الساعة الذهبية' } },
    { id: 'evening', label: { en: 'Candlelit Evening', ar: 'أمسية الشموع' } },
    { id: 'day', label: { en: 'Daylight', ar: 'ضوء النهار' } },
  ],
}

// Bespoke offer from the brand book: corporate events, prestigious brands and VIP clients.
export const corporate = {
  intro: {
    en: 'Corporate gifting programs for prestigious brands and VIP clients, with signature packaging available only through Ghalia.',
    ar: 'برامج هدايا الشركات للعلامات المرموقة وكبار العملاء، بتغليف مميز لا يتوفر إلا لدى غالية.',
  },
  moments: [
    { title: { en: 'Corporate gifts', ar: 'هدايا الشركات' }, text: { en: 'Signature Rose is suitable for corporate gifts and exclusive seasonal editions.', ar: 'تناسب مجموعة الوردة المميزة هدايا الشركات والإصدارات الموسمية الحصرية.' }, image: 'rose-1', to: '/collections/signature-rose' },
    { title: { en: 'Ramadan corporate hampers', ar: 'سلال رمضان للشركات' }, text: { en: 'Royal blue, emerald and gold, ideal for luxury gifting and corporate hampers.', ar: 'الأزرق الملكي والزمردي والذهبي، مثالية للهدايا الفاخرة وسلال الشركات.' }, image: 'ramadan-1', to: '/collections/ramadan' },
    { title: { en: 'Saudi National Day', ar: 'اليوم الوطني السعودي' }, text: { en: 'Emerald green and luxurious gold, a blend of contemporary luxury and Saudi identity.', ar: 'الأخضر الزمردي والذهبي الفاخر، مزيج من الفخامة المعاصرة والهوية السعودية.' }, image: 'national-5', to: '/collections/saudi-national-day' },
    { title: { en: 'Corporate events', ar: 'مناسبات الشركات' }, text: { en: 'Complete event experiences, from creative concept to flawless execution.', ar: 'تجارب مناسبات متكاملة، من ابتكار المفهوم إلى التنفيذ المتقن.' }, image: 'boutique', to: '/weddings' },
  ],
}
