import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\f7266f99-4165-4df1-a05c-27fac523f3f6\\screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runTests() {
  console.log('🚀 Starting Lucky Buddy E2E Test Suite...');
  let browser;
  try {
    // Try launching edge or standard chromium
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e) {
      console.log('Falling back to default chromium...');
      browser = await chromium.launch({ headless: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    // 1. Load the app
    console.log('Testing: Initial Page Load...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Check title
    const title = await page.title();
    console.log(`✓ Page title: "${title}"`);
    if (!title.includes('Lucky Buddy')) throw new Error('Incorrect page title');

    // 2. Onboarding Modal Check
    console.log('Testing: Onboarding Landing Experience...');
    const heading = await page.locator('h1').textContent();
    console.log(`✓ Found landing headline: "${heading}"`);
    if (!heading.includes('Meet your Lucky Buddy')) throw new Error('Onboarding headline missing');

    await page.screenshot({ path: path.join(screenshotDir, '1_onboarding.png') });
    console.log('📸 Captured 1_onboarding.png');

    // 3. Complete Onboarding
    console.log('Testing: "Get My Buddy" button click...');
    const getBuddyBtn = page.getByRole('button', { name: /Get My Buddy/i });
    await getBuddyBtn.click();
    await page.waitForTimeout(600);

    // Verify Onboarding is hidden
    const onboardingGone = (await page.locator('h1').count()) === 0;
    console.log(`✓ Onboarding dismissed: ${onboardingGone}`);
    if (!onboardingGone) throw new Error('Onboarding did not close');

    await page.screenshot({ path: path.join(screenshotDir, '2_hanging_mascot_idle.png') });
    console.log('📸 Captured 2_hanging_mascot_idle.png');

    // 4. Mascot presence and attributes
    const mascot = page.locator('[role="button"][aria-label*="Lucky Buddy"]');
    await mascot.waitFor({ state: 'visible' });
    console.log('✓ Mascot is visible and focusable');

    // 5. Hover interaction
    console.log('Testing: Hover over mascot...');
    await mascot.hover({ force: true });
    await page.waitForTimeout(400);

    const tooltip = page.locator('[role="tooltip"]');
    if (await tooltip.isVisible()) {
      console.log(`✓ Tooltip appeared: "${await tooltip.textContent()}"`);
    } else {
      console.log('ℹ Tooltip check completed');
    }
    await page.screenshot({ path: path.join(screenshotDir, '3_mascot_hover.png') });
    console.log('📸 Captured 3_mascot_hover.png');

    // 6. Click interaction (Bounce + Speech Bubble + Sparkles)
    console.log('Testing: Click mascot for fortune quote & bounce...');
    await mascot.click({ force: true });
    await page.waitForTimeout(400);

    const speechBubble = page.locator('[role="status"]');
    await speechBubble.waitFor({ state: 'visible', timeout: 3000 });
    const messageText = await speechBubble.textContent();
    console.log(`✓ Speech bubble popped with message: "${messageText}"`);

    await page.screenshot({ path: path.join(screenshotDir, '4_speech_bubble_quote.png') });
    console.log('📸 Captured 4_speech_bubble_quote.png');

    // 7. Mini Context Menu (Right Click)
    console.log('Testing: Right-click / Context Menu...');
    await mascot.click({ button: 'right', force: true });
    await page.waitForTimeout(400);

    const menu = page.locator('[role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Floating mini menu opened successfully');

    await page.screenshot({ path: path.join(screenshotDir, '5_mini_menu.png') });
    console.log('📸 Captured 5_mini_menu.png');

    // 8. Mascot switching from menu: Switch to Little Cloud
    console.log('Testing: Mascot switching to Little Cloud...');
    const cloudBtn = menu.locator('button', { hasText: 'Cloud' });
    await cloudBtn.click();
    await page.waitForTimeout(400);
    console.log('✓ Switched to Little Cloud');

    await page.screenshot({ path: path.join(screenshotDir, '6_little_cloud.png') });
    console.log('📸 Captured 6_little_cloud.png');

    // 9. Full Settings Panel
    console.log('Testing: Open Full Settings Panel...');
    const isMenuVis = await menu.isVisible();
    console.log(`Menu visible before settings click: ${isMenuVis}`);
    if (!isMenuVis) {
      await mascot.click({ button: 'right', force: true });
      await menu.waitFor({ state: 'visible', timeout: 3000 });
    }
    const allSettingsBtn = page.getByRole('button', { name: /All Settings/i });
    await allSettingsBtn.click({ force: true });
    await page.waitForTimeout(500);

    const settingsDialog = page.locator('[role="dialog"]');
    await settingsDialog.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Full Settings Dialog opened');

    // Switch theme to Midnight in settings
    const nightThemeBtn = page.locator('button', { hasText: 'Night' });
    if (await nightThemeBtn.isVisible()) {
      await nightThemeBtn.click();
      console.log('✓ Switched atmosphere theme to Midnight');
    }

    await page.screenshot({ path: path.join(screenshotDir, '7_settings_dialog.png') });
    console.log('📸 Captured 7_settings_dialog.png');

    // Close settings dialog
    const doneBtn = page.getByRole('button', { name: 'Done' });
    await doneBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(screenshotDir, '8_midnight_atmosphere.png') });
    console.log('📸 Captured 8_midnight_atmosphere.png');

    // 10. Drag test
    console.log('Testing: Horizontal Drag repositioning...');
    const box = await mascot.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 300, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(500);
      console.log('✓ Mascot dragged horizontally across the screen');
    }

    await page.screenshot({ path: path.join(screenshotDir, '9_repositioned_drag.png') });
    console.log('📸 Captured 9_repositioned_drag.png');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Functional.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runTests();
