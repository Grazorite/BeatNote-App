import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Ensure the web server is ready before running tests
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the app to be available
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:8081', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Verify the app loaded correctly
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ BeatNote app is ready for testing');
  } catch (error) {
    console.error('❌ Failed to verify app readiness:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;