import { chromium } from "playwright";

const urls = ["https://capitalai.online/", "https://www.capitalai.online/"];
const browser = await chromium.launch();

for (const url of urls) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    const body = await page.innerText("body");
    const pngLogo = await page.locator('img[src*="coin-logo"]').count();
    console.log(
      JSON.stringify({
        start: url,
        final: page.url(),
        errorUI: body.includes("Something went wrong"),
        pngLogo: pngLogo > 0,
        jsErrors: errors,
      })
    );
  } catch (e) {
    console.log(JSON.stringify({ start: url, fail: e.message.split("\n")[0] }));
  }
  await page.close();
}

await browser.close();
