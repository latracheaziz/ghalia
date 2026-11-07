// "Our Expertise" from the brand book, each routed to where it lives on the site.
export const expertise = [
  { name: { en: 'Handcrafted Chocolates', ar: 'شوكولاتة مصنوعة باليد' }, to: '/atelier', hash: 'chocolates', image: 'mood-craft' },
  { name: { en: 'Luxury Pastries and Desserts', ar: 'حلويات ومعجنات فاخرة' }, to: '/atelier', hash: 'pastries', image: 'classic-3' },
  { name: { en: 'Signature Chocolate Trays', ar: 'أطباق الشوكولاتة الخاصة' }, to: '/atelier', hash: 'halo', image: 'halo-tray' },
  { name: { en: 'Bespoke Gifting', ar: 'هدايا على الطلب' }, to: '/collections', image: 'gift-heritage' },
  { name: { en: 'Weddings and Events', ar: 'أعراس ومناسبات' }, to: '/weddings', image: 'mood-arch' },
  { name: { en: '3D Event Concept Design', ar: 'تصميم مفاهيم المناسبات ثلاثي الأبعاد' }, to: '/studio', image: 'pergola-ceremony' },
  { name: { en: 'Corporate Gifting Solutions', ar: 'حلول هدايا الشركات' }, to: '/corporate', image: 'national-5' },
  { name: { en: 'Luxury Catering Experiences', ar: 'تجارب ضيافة وتقديم فاخرة' }, to: '/weddings', hash: 'catering', image: 'hosts' },
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

// "How it works", from the Weddings and Events page of the website copy.
export const journey = [
  { title: { en: 'Consultation', ar: 'الجلسة الأولى' }, text: { en: 'We listen to your story, your style and your vision for the day.', ar: 'نسمع قصتكم وذوقكم ورؤيتكم لليوم.' } },
  { title: { en: 'Concept', ar: 'الفكرة' }, text: { en: 'Our design team shapes a creative direction made only for you.', ar: 'يرسم فريقنا اتجاه إبداعي مخصص لكم وحدكم.' } },
  { title: { en: '3D Visualization', ar: 'التصور ثلاثي الأبعاد' }, text: { en: 'You see your entire event in immersive detail and refine it with us.', ar: 'تشوفون مناسبتكم كاملة بالتفصيل وتعدّلون معنا.' } },
  { title: { en: 'Curation', ar: 'الاختيار والتنسيق' }, text: { en: 'Every dessert, tray, decoration and detail is selected and designed in-house.', ar: 'كل حلا وصينية وديكور وتفصيلة تُختار وتُصمَّم عندنا.' } },
  { title: { en: 'Execution', ar: 'التنفيذ' }, text: { en: 'Our team delivers the celebration flawlessly, so you can simply be present.', ar: 'يسلّمكم فريقنا الحفل بدون ولا خلل، وأنتم بس استمتعوا.' } },
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

// The Gifting page of the website copy. Images and links are unchanged.
export const corporate = {
  title: { en: 'Gifting', ar: 'الإهداء' },
  headline: { en: 'Every gift tells a story. Make yours unforgettable.', ar: 'كل هدية تحكي قصة.. خلّوا قصتكم تنذكر.' },
  intro: {
    en: 'The best gifts are remembered long after the moment has passed. At Ghalia, gifting is an art: considered, personal and designed to leave a lasting impression.',
    ar: 'أحلى الهدايا هي اللي تبقى في البال بعد ما تنتهي اللحظة. وفي غالية، الإهداء فنّ: مدروس وشخصي ومصمَّم يترك أثر.',
  },
  moments: [
    {
      title: { en: 'Bespoke Gifting', ar: 'هدايا على الطلب' },
      text: {
        en: 'For weddings, births, graduations, anniversaries, Ramadan, Eid or simply because someone deserves it, we design gift collections around the person and the occasion. Choose from our signature collections, or work with our design team to create something entirely your own, from the chocolates inside to the ribbon on the box.',
        ar: 'للأعراس والمواليد والتخرّج والذكريات السنوية ورمضان والعيد، أو بس لأن فيه أحد يستاهل، نصمّم تشكيلات الهدايا على الشخص وعلى المناسبة. اختاروا من تشكيلاتنا الخاصة، أو اشتغلوا مع فريق التصميم عندنا وسوّوا شي يخصّكم وحدكم، من الشوكولاتة اللي بالداخل لين الشريطة اللي على العلبة.',
      },
      image: 'rose-1',
      to: '/collections/signature-rose',
    },
    {
      title: { en: 'Corporate Gifting Solutions', ar: 'حلول هدايا الشركات' },
      text: {
        en: 'For prestigious brands and VIP clients, a gift is a statement. Ghalia creates corporate gifting programs that reflect the standards of the company giving them and the importance of the person receiving them.',
        ar: 'للعلامات المرموقة وعملاء كبار الشخصيات، الهدية رسالة. وغالية تصمّم برامج هدايا للشركات تعكس مستوى الجهة المهدية ومكانة المُهدى له.',
      },
      image: 'ramadan-1',
      to: '/collections/ramadan',
    },
    {
      title: { en: 'The Ghalia standard', ar: 'معيار غالية' },
      text: {
        en: 'Every piece is handcrafted, designed in-house and presented with the same attention to detail, whether it is one gift or one thousand.',
        ar: 'كل قطعة مصنوعة باليد ومصمَّمة عندنا وتُقدَّم بنفس العناية بالتفاصيل، سواء كانت هدية وحدة أو ألف هدية.',
      },
      image: 'national-5',
      to: '/collections/saudi-national-day',
    },
    {
      title: { en: 'Corporate and Private Events', ar: 'مناسبات الشركات والمناسبات الخاصة' },
      text: {
        en: 'From boardroom launches to private receptions, our team designs the sweet side of the occasion, including chocolate tables, desserts and luxury catering, all consistent with your brand.',
        ar: 'من إطلاقات القاعات لين الاستقبالات الخاصة، يصمّم فريقنا الجانب الحلو من مناسبتكم: طاولات شوكولاتة وحلويات وضيافة فاخرة، كلها متناغمة مع هوية علامتكم.',
      },
      image: 'boutique',
      to: '/weddings',
    },
  ],
  closing: { en: 'Tell us about your occasion, and we will design the gift.', ar: 'قولوا لنا عن مناسبتكم، وعلينا تصميم الهدية.' },
}
