const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { connectDB } = require("./db");
const { Article } = require("./model");
require("dotenv").config();
const colors = require("colors");

const csvWriter = createCsvWriter({
  path: `${new Date().getDate()}${new Date().getMonth() + 1
    }${new Date().getFullYear()}_verge.csv`,
  header: ["id", "headline", "author", "date", "URL"],
});

const fetchArticles = async (page) => {
  console.log("Fetching articles...");
  const articles = await page.$$eval(
    ".max-w-content-block-standard",
    (articles) => {
      return articles.map((article) => {
        const headline = article.querySelector("h2").innerText;
        const author = article.querySelector("div .inline-block a").innerText;
        const URL = article.querySelector("h2 a").getAttribute("href");
        return { headline, URL, author };
      });
    }
  );
  return articles;
};

const fixURL = (articles) => {
  console.log("Fixing URLs...");
  articles.map((article) => {
    article.URL = `https://www.theverge.com${article.URL}`;
  });
};

const addDates = async (articles, page) => {
  console.log("Adding dates...");
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    await page.goto(article.URL);
    const date = await page.$eval("time", (date) => date.innerText);
    article.date = date;
  }
};

const addToDB = async (articles) => {
  console.log("Saving articles to database...");
  const insertedArticles = await Article.create({
    date: `${new Date().getDate()}/${new Date().getMonth() + 1
      }/${new Date().getFullYear()}`,
    articles,
  });
  return insertedArticles;
};

const runScript = async () => {
  try {
    console.log("Running script...".green);
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.theverge.com");
    console.log("Browser launched");

    const articles = await fetchArticles(page);
    console.log("Articles fetched");

    fixURL(articles);
    console.log("URLs fixed");

    await addDates(articles, page);
    console.log("Dates added");

    const insertedArticles = await addToDB(articles);
    console.log("Articles saved to database");

    console.log("Saving articles to CSV...");
    for (let i = 0; i < articles.length; i++) {
      articles[i].id = insertedArticles.articles[i]._id.toString();
    }
    console.log(articles);
    await csvWriter.writeRecords(articles);
    console.log("Articles saved to CSV");

    console.log("Closing browser...");
    await browser.close();
    console.log("Browser closed");
    console.log("Script finished".red);
    setTimeout(runScript, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  await connectDB();
  await runScript();
};

main();
