// Copy from "GHALIA | Website Content": the Home page (Hero, The World of Ghalia, Discover Ghalia).
// English and Arabic are the documents' own text.

export const home = {
  meta: {
    en: 'From fine chocolates and carefully crafted pastries to thoughtful gifts and celebration details, Ghalia creates experiences worthy of your most treasured moments.',
    ar: 'من الشوكولاتة الفاخرة والحلويات المصنوعة بعناية، إلى الهدايا والتفاصيل التي تضيف إلى مناسباتكم، نخلق في غالية تجارب تليق بلحظاتكم الثمينة.',
  },

  hero: {
    headline: { en: 'GHALIA. Because some moments are priceless.', ar: 'غالية... لأن بعض اللحظات لا تُقدَّر بثمن.' },
    tagline: { en: 'Because some moments are priceless.', ar: 'لأن بعض اللحظات لا تُقدَّر بثمن.' },
    // The hero paragraph, told one clause at a time as the film scrolls.
    lines: [
      { en: 'From fine chocolates and carefully crafted pastries', ar: 'من الشوكولاتة الفاخرة والحلويات المصنوعة بعناية،' },
      { en: 'to thoughtful gifts and celebration details,', ar: 'إلى الهدايا والتفاصيل التي تضيف إلى مناسباتكم،' },
      { en: 'Ghalia creates experiences worthy of your most treasured moments.', ar: 'نخلق في غالية تجارب تليق بلحظاتكم الثمينة.' },
    ],
    buttons: {
      collections: { en: 'Explore Our Collections', ar: 'اكتشف مجموعاتنا' },
      events: { en: 'Discover Events', ar: 'اكتشف خدمات المناسبات' },
    },
  },

  world: {
    eyebrow: { en: 'The World of Ghalia', ar: 'عالم غالية' },
    headline: { en: 'Beyond chocolate, a story told through taste.', ar: 'أكثر من شوكولاتة... حكاية تُروى بالمذاق.' },
    body: {
      en: 'At Ghalia, we believe the smallest details hold the most cherished memories—and a single flavor can bring an entire story back to life. We craft fine chocolates and pastries and create experiences that bring together exceptional ingredients and elegant presentation, making every occasion worth remembering.',
      ar: 'في غالية، نؤمن بأن أجمل الذكريات ترتبط بأبسط التفاصيل، وأن مذاقًا واحدًا قد يعيد إلينا حكاية كاملة. نصنع الشوكولاتة والحلويات الفاخرة، ونبتكر تجارب تجمع بين جودة المكونات وجمال التقديم، لتبقى كل مناسبة ذكرى تستحق الاحتفاء.',
    },
    button: { en: 'Discover Our Story', ar: 'تعرّف على حكايتنا' },
  },

  discover: {
    title: { en: 'Discover Ghalia', ar: 'اكتشف غالية' },
    items: [
      {
        to: '/atelier',
        image: 'mood-craft',
        title: { en: 'Chocolate & Patisserie', ar: 'الشوكولاتة والباتيسري' },
        text: {
          en: 'Handcrafted chocolates and fine pastries where exquisite flavors meet refined presentation.',
          ar: 'تشكيلة من الشوكولاتة المصنوعة يدويًا والحلويات الفاخرة، حيث يلتقي المذاق المميز بجمال التفاصيل.',
        },
        alt: { en: 'A gold nozzle finishing chocolates by hand', ar: 'نقش ذهبي على الشوكولاتة باليد' },
      },
      {
        to: '/collections',
        image: 'gift-heritage',
        title: { en: 'Gift Collections', ar: 'مجموعات الهدايا' },
        text: {
          en: 'Carefully designed collections that give every gift a personal touch and express your sentiments with elegance.',
          ar: 'مجموعات صُمّمت بعناية لتمنح كل هدية طابعًا خاصًا، وتعبّر عن مشاعركم بأناقة.',
        },
        alt: { en: 'A GHALIA gift box in the Arabian Heritage collection', ar: 'علبة هدايا غالية من مجموعة التراث العربي' },
      },
      {
        to: '/weddings',
        image: 'pergola-ceremony',
        title: { en: 'Weddings & Celebrations', ar: 'المناسبات والاحتفالات' },
        text: {
          en: 'From intimate gatherings to grand weddings, we create tailored experiences that reflect your taste and the spirit of your occasion.',
          ar: 'من اللقاءات العائلية إلى حفلات الزفاف والمناسبات الكبرى، نصنع تجارب متكاملة تعكس ذائقتكم وجمال التفاصيل المختارة.',
        },
        alt: { en: 'A ceremony aisle under a flowered pergola', ar: 'ممر حفل تحت برجولة مزهرة' },
      },
    ],
  },
}
