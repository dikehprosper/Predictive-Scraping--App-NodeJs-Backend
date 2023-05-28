const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const fs = require("fs");
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



//countdown section 

let count = 49;
let activeButton = 0;
let interval;

function startCountdown() {
  interval = setInterval(() => {
    if (count > 0) {
      count--;
      activeButton++;
    } else {
      clearInterval(interval);
      // Perform any necessary actions when the countdown reaches 0
      // e.g., fetchData(), restartCountdown(), etc.

      restartCountdown();
    }


  }, 1000);
}

function restartCountdown() {
  count = 49;
  activeButton = 4;
}

app.get('/countdown', (req, res) => {
  res.json({ count, activeButton });
});


// Start the countdown when the server starts
startCountdown();








const intervalInMilliseconds = 7000; // 7 seconds
let previousData = fs.readFileSync("scraped-data.json", "utf8"); // Read the current data from scraped-data.json

async function scrapeAndStoreData() {
  try {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.goto("https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201");

    const balls = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".balls span"), (e) => e.textContent)
    );

    const statistics = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.statistics > tbody > tr > td'), (e) => e.textContent)
    );

    const statistics1 = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.statistics > tbody > tr > td > .colours'), (e) => e.textContent)
    );

    const statistics2 = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.hot .ball-holder .ball-value'), (e) => e.textContent)
    );

    const statistics3 = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.cold .ball-holder .ball-value'), (e) => e.textContent)
    );

    const statistics4 = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.hot .stats__numbers-count--value'), (e) => e.textContent)
    );

    const statistics5 = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.cold .stats__numbers-count--value'), (e) => e.textContent)
    );

    await browser.close();

    const data = {
      balls,
      statistics,
      statistics1,
      statistics2,
      statistics3,
      statistics4,
      statistics5,
    };

    const jsonData = JSON.stringify(data);

    // Check if the newly scraped data is different from the previous data
    if (jsonData !== previousData) {
      fs.writeFile("scraped-data.json", jsonData, (err) => {
        if (err) {
          console.error("An error occurred while writing the file:", err);
        } else {
          console.log("Data scraped and stored successfully!");
          previousData = jsonData; // Update the previousData variable with the new data
        }
      });
    } else {
      console.log("Data is the same!");
    }
  } catch (error) {
    console.error("An error occurred during web scraping:", error);
  }
}

// Run the scraping and storing process initially
scrapeAndStoreData();

// Schedule the scraping and storing process to run every 7 seconds
setInterval(scrapeAndStoreData, intervalInMilliseconds);

// Start the Express server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});



app.get("/fetch-data1", (req, res) => {
  fs.readFile("scraped-data.json", (err, data) => {
    if (err) {
      console.error("An error occurred while reading the file:", err);
      res.status(500).send("An error occurred while fetching the data.");
    } else {
      const jsonData = JSON.parse(data);
      res.status(200).json(jsonData);
    }
  });
});



app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
