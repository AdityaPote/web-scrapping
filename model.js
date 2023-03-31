const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  date: String,
  articles: [
    {
      headline: String,
      URL: String,
      author: String,
      id: String,
      date: String,
    },
  ],
});

const Article = mongoose.model("Article", articleSchema);

module.exports = { Article };
