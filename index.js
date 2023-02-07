const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const chromium = require("chrome-aws-lambda")

async function getBrowserInstance() {
    const executablePath = await chromium.executablePath;
 
    return chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }
  

app.get("/fetch-page", async (req, res) => {
  const browser = await getBrowserInstance();;
  const page = await browser.newPage();

  await page.goto("https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201");
  const html = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".balls span"), (e) => e.textContent)
);
  await browser.close();
  res.send(html);
});

app.get("/fetch-data", async (req, res) => {
    const browser = await getBrowserInstance();;
    const page = await browser.newPage();
  
    await page.goto("https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201");
  const html = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.statistics> tbody> tr> td'), (e) => e.textContent));
  
    await browser.close();
    res.send(html);
  });

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
