import { expect, test } from '@playwright/test'

const ROUTES = [
  '/', '/maison', '/atelier', '/collections', '/collections/standard-classic', '/collections/arabian-heritage',
  '/collections/signature-rose', '/collections/ramadan', '/collections/eid-al-fitr', '/collections/eid-al-adha',
  '/collections/saudi-national-day', '/weddings', '/studio', '/corporate', '/order', '/contact',
]

/** Opens a page and waits until the preloader has lifted. */
async function open(page, path) {
  await page.goto(path)
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 30_000 })
}

function trackErrors(page) {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  return errors
}

const adminList = async (request) => {
  const res = await request.get('/api/admin/submissions', { headers: { authorization: 'Bearer e2e-token' } })
  return (await res.json()).submissions
}

test.describe('every page', () => {
  for (const path of ROUTES) {
    test(`${path} renders without errors`, async ({ page }) => {
      const errors = trackErrors(page)
      await open(page, path)
      await expect(page.locator('main')).toBeVisible()
      await expect(page).toHaveTitle(/GHALIA/)
      await expect(page.locator('h1').first()).toBeAttached()
      expect(errors).toEqual([])
    })
  }

  test('every internal link leads somewhere real', async ({ page }) => {
    test.setTimeout(420_000)
    const targets = new Map()
    for (const path of ROUTES) {
      await page.goto(path)
      await expect(page.locator('main')).toBeAttached({ timeout: 30_000 })
      const hrefs = await page.$$eval('a[href^="/"]', (links) => links.map((a) => a.getAttribute('href')))
      for (const href of hrefs) {
        const [target, hash] = href.split('#')
        if (!targets.has(target)) targets.set(target, new Set())
        if (hash) targets.get(target).add(hash)
      }
    }
    expect(targets.size).toBeGreaterThan(15)
    for (const [target, hashes] of targets) {
      await page.goto(target)
      await expect(page.locator('main'), `${target} should render`).toBeAttached({ timeout: 30_000 })
      await expect(page.locator('.lost'), `${target} should not be a 404`).toHaveCount(0)
      for (const hash of hashes) await expect(page.locator(`#${hash}`), `${target} needs #${hash}`).toBeAttached()
    }
  })

  test('unknown paths and collections show the 404 page', async ({ page }) => {
    await open(page, '/nowhere')
    await expect(page.locator('.lost')).toBeVisible()
    await page.goto('/collections/not-a-collection')
    await expect(page.locator('.lost')).toBeVisible()
  })
})

test.describe('navigation', () => {
  test('menu opens, takes focus, closes on Escape and navigates', async ({ page }) => {
    await open(page, '/maison')
    await page.getByRole('button', { name: 'Menu' }).first().click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator(':focus')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await page.getByRole('button', { name: 'Menu' }).first().click()
    await dialog.getByRole('link', { name: 'Corporate Gifting' }).click()
    await expect(page).toHaveURL(/\/corporate$/)
    await expect(page.locator('.curtain')).toBeHidden({ timeout: 8000 })
    await expect(dialog).toBeHidden()
  })

  test('moving between collections lifts the curtain each time', async ({ page }) => {
    await open(page, '/collections/ramadan')
    await expect(page.locator('h1')).toContainText('Ramadan')
    await page.locator('.next').click()
    await expect(page).toHaveURL(/eid-al-fitr$/)
    await expect(page.locator('h1')).toContainText('Eid Al Fitr')
    await expect(page.locator('.curtain')).toBeHidden({ timeout: 8000 })
    await page.locator('.next').click()
    await expect(page).toHaveURL(/eid-al-adha$/)
    await expect(page.locator('.curtain')).toBeHidden({ timeout: 8000 })
  })

  test('browser back returns to the previous page', async ({ page }) => {
    await open(page, '/collections')
    await page.locator('.index__item a').first().click()
    await expect(page).toHaveURL(/standard-classic$/)
    await expect(page.locator('.curtain')).toBeHidden({ timeout: 8000 })
    await page.goBack()
    await expect(page).toHaveURL(/\/collections$/)
    await expect(page.locator('.index__list')).toBeVisible()
  })

  test('collection filter narrows the list', async ({ page }) => {
    await open(page, '/collections')
    await expect(page.locator('.index__item')).toHaveCount(7)
    await page.getByRole('button', { name: 'Seasonal & limited' }).click()
    await expect(page.locator('.index__item')).toHaveCount(4)
    await page.getByRole('button', { name: 'The signature lines' }).click()
    await expect(page.locator('.index__item')).toHaveCount(3)
  })

  test('language switch mirrors the site and survives a reload', async ({ page }) => {
    await open(page, '/maison')
    await page.getByRole('button', { name: 'Switch to Arabic' }).click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('.curtain')).toBeHidden({ timeout: 8000 })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('h1').first()).toContainText('بدت في مطبخ')
  })
})

test.describe('ordering', () => {
  test('a visitor composes a gift and sends it to the Maison on WhatsApp', async ({ page }) => {
    await open(page, '/order?collection=ramadan')
    await expect(page.getByRole('button', { name: /^Bag/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Corporate hamper' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Chocolates & dates' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Increase quantity' }).click()
    await page.getByLabel('Gift note (optional)').fill('Ramadan Kareem')
    await page.getByRole('button', { name: 'Next' }).click()

    const order = page.getByRole('link', { name: /Order on WhatsApp/ })
    await expect(order).toHaveAttribute('target', '_blank')
    const href = await order.getAttribute('href')
    expect(href.startsWith('https://wa.me/966543422132?text=')).toBe(true)
    const message = new URL(href).searchParams.get('text')
    expect(message).toContain('The collection: Ramadan')
    expect(message).toContain('The format: Corporate hamper')
    expect(message).toContain('Inside: Chocolates & dates')
    expect(message).toContain('Quantity: 2')
    expect(message).toContain('Gift note: Ramadan Kareem')
  })

  test('collection pages hand their format to the order page', async ({ page }) => {
    await open(page, '/collections/signature-rose')
    await page.getByRole('link', { name: 'Square gift box' }).click()
    await expect(page).toHaveURL(/collection=signature-rose&format=square-box/)
    // The order page loads its 3D chooser on arrival, which is slow under software rendering.
    await expect(page.getByRole('button', { name: 'Square gift box' })).toHaveAttribute('aria-pressed', 'true', { timeout: 30_000 })
    await page.getByRole('button', { name: 'The collection' }).click()
    await expect(page.getByRole('button', { name: 'Signature Rose' })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('enquiries', () => {
  test('a wedding enquiry reaches the inbox, which is locked by token', async ({ page, request }) => {
    await open(page, '/weddings')
    await page.getByLabel('Full name').fill('Layla Hotel Group')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Tell us about your vision').fill('A collaboration with our hotels.')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Send to the Maison' }).click()
    await expect(page.getByText('Please enter a valid email.')).toBeVisible()

    await page.getByLabel('Email').fill('layla@example.com')
    await page.getByRole('button', { name: 'Send to the Maison' }).click()
    const reference = await page.locator('.sent__ref').textContent()
    expect((await adminList(request)).find((s) => s.reference === reference).kind).toBe('wedding')

    await open(page, '/inbox')
    await page.getByLabel('Admin token').fill('wrong')
    await page.getByRole('button', { name: 'Open inbox' }).click()
    await expect(page.getByText('That token was not accepted.')).toBeVisible()
    await page.getByLabel('Admin token').fill('e2e-token')
    await page.getByRole('button', { name: 'Open inbox' }).click()

    const row = page.locator('.inbox__row', { hasText: reference })
    await expect(row).toContainText('A collaboration with our hotels.')
    await row.getByRole('combobox').selectOption('closed')
    await expect.poll(async () => (await adminList(request)).find((s) => s.reference === reference).status).toBe('closed')
  })

  test('a failed send keeps what the visitor typed', async ({ page }) => {
    await open(page, '/weddings')
    await page.route('**/api/submissions', (route) => route.abort())
    await page.getByLabel('Full name').fill('Sara')
    await page.getByLabel('Email').fill('sara@example.com')
    await page.getByLabel('Tell us about your vision').fill('A spring wedding.')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Send to the Maison' }).click()
    await expect(page.getByRole('alert')).toContainText('could not send')
    await expect(page.getByLabel('Tell us about your vision')).toHaveValue('A spring wedding.')
  })
})

test.describe('3D experiences', () => {
  test('the Studio updates, exports and sends a concept on WhatsApp', async ({ page }) => {
    await open(page, '/studio')
    await expect(page.locator('.studio canvas')).toBeVisible()

    await page.getByRole('button', { name: 'Pergola' }).click()
    await page.getByRole('button', { name: 'Emerald & Gold' }).click()
    await page.getByRole('button', { name: 'Candlelit Evening' }).click()
    await expect(page).toHaveURL(/setting=pergola/)
    await expect(page).toHaveURL(/palette=emerald/)
    await expect(page).toHaveURL(/mood=evening/)

    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Save image' }).click()
    expect((await download).suggestedFilename()).toBe('ghalia-concept-pergola.png')

    const send = page.getByRole('link', { name: /Send this concept/ })
    await expect(send).toHaveAttribute('target', '_blank')
    const href = await send.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/966543422132\?text=/)
    const text = decodeURIComponent(href.split('?text=')[1])
    for (const line of ['Pergola', 'Emerald & Gold', 'Candlelit Evening']) expect(text).toContain(line)
    expect(text).toContain('setting=pergola')
  })

  test('a shared Studio link restores the design', async ({ page }) => {
    await open(page, '/studio?setting=reception&palette=royal&floral=light&mood=day')
    await expect(page.getByRole('button', { name: 'Reception Table' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Royal Blue & Gold' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('the Halo Tray viewer switches views', async ({ page }) => {
    await open(page, '/atelier')
    await page.locator('#halo').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('graceful fallbacks', () => {
  test('without WebGL the site still works, with photographs', async ({ page }) => {
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
        return /webgl/.test(type) ? null : real.call(this, type, ...args)
      }
    })
    const errors = trackErrors(page)
    await open(page, '/')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.scene__fallback img')).toBeVisible()
    await open(page, '/studio')
    await expect(page.locator('.scene__fallback img')).toBeVisible()
    await expect(page.getByText('3D is not available on this device')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('reduced motion shows the whole story with nothing hidden', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    await open(page, '/')
    for (const text of ['Where a childhood dream became a Patisserie.', 'Some recipes are never written down.']) {
      await expect(page.getByText(text).first()).toBeVisible()
    }
    await context.close()
  })

  test('phones get the swipe reel instead of the pinned one', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    const page = await context.newPage()
    await open(page, '/')
    await expect(page.locator('.reel--pinned')).toHaveCount(0)
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(sideways).toBeLessThanOrEqual(0)
    await context.close()
  })
})

test.describe('social accounts', () => {
  test('the contact page and the footer link every account, and Facebook stays hidden without an address', async ({ page }) => {
    await open(page, '/contact')
    // One screen per account; only the one on screen is reachable, so check the links themselves.
    const links = page.locator('.pour__panel a.pour__cta')
    await expect(links).toHaveCount(6)
    expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
      'https://www.instagram.com/gh.alia415',
      'https://wa.me/966543422132',
      'https://www.youtube.com/@GhaliaInfo',
      'https://www.threads.com/@gh.alia415',
      'https://www.snapchat.com/@ghaliainfo',
      'https://linktr.ee/Ghali.A',
    ])
    await expect(links.first()).toHaveAttribute('target', '_blank')
    // The dots pour straight to an account.
    await page.getByRole('button', { name: 'Go to Snapchat' }).click()
    await expect(page.locator('.pour__panel.is-on .pour__name')).toContainText('Snapchat', { timeout: 15_000 })
    // A real click: it fails if the chocolate canvas lies over the link.
    await page.context().route('https://www.snapchat.com/**', (route) => route.fulfill({ body: 'ok' }))
    const popup = page.waitForEvent('popup')
    await page.getByRole('link', { name: /Open Snapchat/ }).click()
    await expect.poll(async () => (await popup).url()).toContain('snapchat.com/@ghaliainfo')
    await expect(page.locator('.footer__social a')).toHaveCount(6)
    await expect(page.locator('a[href*="facebook"]')).toHaveCount(0)
  })
})

test.describe('admin', () => {
  test('five clicks on the wordmark open the admin, which signs in and saves a post', async ({ page }) => {
    const errors = trackErrors(page)
    await open(page, '/')
    const mark = page.locator('.film__mega')
    for (let i = 0; i < 5; i++) await mark.click({ force: true, delay: 40 })
    await expect(page).toHaveURL(/\/admin$/)

    await page.fill('#adm-email', 'ghalia@gmail.com')
    await page.fill('#adm-password', 'not-it')
    await page.click('button[type=submit]')
    await expect(page.getByRole('alert')).toContainText('don’t match')
    await page.fill('#adm-password', 'ir123456')
    await page.click('button[type=submit]')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

    await page.getByRole('button', { name: 'Blog' }).click()
    await page.getByRole('button', { name: 'New article' }).first().click()
    await page.fill('#art-title', 'A new collection')
    await page.fill('#art-body', 'Text.')
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await expect(page.locator('.adm-row')).toContainText('A new collection')

    await page.getByRole('button', { name: 'Social media' }).click()
    await page.getByRole('button', { name: 'New post' }).first().click()
    await page.locator('.adm-platform-toggle', { hasText: 'Facebook' }).click()
    await page.fill('#post-caption', 'From the Patisserie.')
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.locator('.adm-post')).toContainText('From the Patisserie.')

    await page.reload()
    await expect(page.locator('.adm-post')).toContainText('From the Patisserie.')
    expect(errors).toEqual([])
  })
})
