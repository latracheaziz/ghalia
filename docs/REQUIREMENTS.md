# Requirements and open questions

The site was built from two documents by Zineb Bouhouch: **A .Branding Strategy.pdf** (brand book) and **E. ghalia packaging development.pdf** (packaging book). Neither is a website specification, so pages and features were derived from their content.

## Stated digital requirement

The brand book's Future Growth Strategy states one direct requirement: *"Strengthen digital experiences through online ordering, virtual event planning, and 3D wedding visualization."*

| Requirement | Where it lives |
| --- | --- |
| Ordering (showcase site) | `/order`: compose a gift in 3D, then send it to the Maison on WhatsApp. No bag or online checkout |
| Virtual event planning | `/studio`: setting, palette, florals, atmosphere; send, save or share |
| 3D wedding visualization | `/studio` and the Halo Tray viewer on `/atelier` |

## Content coverage

| Source | Where it lives |
| --- | --- |
| Brand Story, About Our Business | `/maison`, home film |
| Our Expertise (8 items) | Home index, each linking to its page; `/maison` |
| Our Promise (statement) | Home, `/maison` |
| Our Vision, Vision Statement | `/maison` |
| Our Promise (5 pillars) | `/maison` |
| Our Mission, Mission Statement | `/maison` |
| How We Fulfill Our Mission, Our Commitment | `/maison` |
| Moodboard: The Essence, The Experience, Our World, palette | `/maison`; palette in `src/styles/tokens.css` |
| Future Growth Strategy (8 priorities) | `/maison` |
| Halo Tray, Concept 01 (size, capacity, materials, features) | `/atelier#halo` |
| GHALIA de Chocolat pergola concept (French board) | `/weddings`, translated |
| In-house Wedding Planner and Creative Design Team | `/weddings` |
| Luxury Catering Experiences | `/weddings#catering` |
| Corporate gifting programs | `/corporate` |
| Collaborations with hotels, fashion houses and lifestyle brands | `/contact?subject=partnership` |
| 7 packaging collections | `/collections` and one page each |

## Needed from the client

These are missing from both documents. Nothing was invented to fill them.

1. **Prices.** There are none, so ordering is a request that the Maison confirms. The site says this plainly and takes no payment.
2. **Payment provider,** if online checkout is wanted. It needs prices and a gateway such as Moyasar, HyperPay or Tap.
3. **Contact details:** phone and email are hidden until set in `.env`. The social accounts (Instagram, WhatsApp, YouTube, Threads, Snapchat, Linktree) were supplied on 2026-11-07; Facebook still needs its address.
4. **Boutique address and hours.** The site gives only "Hail, Saudi Arabia", from the brand book cover.
5. **Delivery areas, lead times and minimum order quantities.**
6. **Product list.** The documents describe packaging and categories, not individual chocolates or flavours.
7. **Privacy policy and terms.** The forms collect personal data, so a policy is needed before launch. Have it reviewed against Saudi Arabia's Personal Data Protection Law.
8. **Domain,** for the sitemap and canonical URLs.

## To confirm with the client

### Legal check before publishing

The **Saudi National Day** packaging shows what looks like the Saudi national emblem (palm and swords), and one box carries Arabic calligraphy that may be religious text. Saudi rules restrict commercial use of national symbols, so this needs legal review before these images or products go public.

### Inconsistencies between the documents

| Item | What the documents say | What the site does |
| --- | --- | --- |
| Brand descriptor | "Chocolate and Patisserie", "Chocolate Maison \| Weddings & Events", "Chocolate Maison & Events" | Uses the second, as on the book cover |
| Sub-brand | "GHALIA de Chocolat" on the pergola board only | Treated as the pergola concept's name |
| "Our Promise" | Heads two different things: the "We don't simply..." lines, and the five pillars | Keeps both, as written |
| Location | "Hail" on the cover, but the boutique image shows the Riyadh skyline | States Hail. The image is used without naming a place |
| Packaging page 8 | Has no heading, and sits after Ramadan. Its images say "Eid Mubarak" | Filed under Eid Al Fitr |
| Boutiques | "Expand Ghalia boutiques" implies at least one exists, but none is listed | No boutique is claimed |

### Decisions made for the client

- **Arabic:** not requested in the documents, but added for the Saudi audience. The Arabic text is a machine-assisted translation and needs review by a native copywriter, especially the collection names and "غالية دو شوكولا".
- **Format names** such as "Crescent box" were named from the packaging photos, except Signature Rose, whose formats are stated in the text. Availability needs confirming.
- **Fillings** (chocolates, pralines, pastries, dates) come from the documents' wording. Only Ramadan is stated to include dates. Both Eid collections also offer them, which should be confirmed.
- **Short headlines** such as "Beyond chocolate, one exclusive destination" are assembled from the documents' own phrases.
- **Wedding journey:** the five steps on `/weddings` are arranged from the documents' descriptions, not listed as steps in them.

## Asset notes

- The logo was traced from the brand book artwork, and the rosette redrawn from a small source. Replace both with the master vector files if available.
- Images came from inside the PDFs and many are under 1200px wide. The pergola image is the weakest, and is shown large on the home page. Professional photography would raise quality noticeably.
- The images appear to be computer-generated mock-ups, not photographs of real products or a real boutique. Consider whether they represent what clients will actually receive.
- The 3D Halo Tray and Studio scenes are procedural sketches based on the concept sheet, not the finished product. The Studio says so on screen.
