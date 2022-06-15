const express = require("express");
const cors = require("cors");
const googleSheetData = require("./googleSheetData/googleSheetData");
require("dotenv").config();
const client = require("./db/db");

const app = express();

app.use(express.json());
const corsConfig = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

const quizCollection = client.db("quiz-app").collection("quizQuestion");

const sendDataToDatabaseFromGoogleSheet = async () => {
  await client.connect();

  const questions = await googleSheetData(
    "A2:A",
    "googleServiceCredentials.json"
  );
  const answers = await googleSheetData(
    "B2:E",
    "googleServiceCredentials.json"
  );
  const correctAnswers = await googleSheetData(
    "F2:F",
    "googleServiceCredentials.json"
  );

  for (let i = 0; i < questions.values.length; i++) {
    const questonAnswerSet = {
      question: questions.values[i][0],
      answer: answers.values[i],
      correctAnswer: correctAnswers.values[i][0],
    };

    const updatedDoc = {
      $set: questonAnswerSet,
    };

    const filter = { question: questions.values[i][0] };
    const options = { upsert: true };

    await quizCollection.updateOne(filter, updatedDoc, options);
  }
};

setInterval(sendDataToDatabaseFromGoogleSheet, 1000 * 60 * 60);

const getRandomIndex = (limit) => {
  const randomIndexArr = [];
  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.floor(Math.random() * limit);
    const exists = randomIndexArr.find((num) => num === randomNumber);
    if (exists) {
      return getRandomIndex(limit);
    }
    randomIndexArr.push(randomNumber);
  }

  return randomIndexArr;
};

app.get("/getAllQuestions", async (req, res) => {
  await client.connect();
  const data = await quizCollection.find({}).toArray();

  const randomIndex = getRandomIndex(data?.length);

  const randomTenQuestions = [];
  for (let i = 0; i < randomIndex.length; i++) {
    const randomIndexNumber = randomIndex[i];
    const randomOneQuestion = data[randomIndexNumber];
    randomTenQuestions.push(randomOneQuestion);
  }

  res.send(randomTenQuestions);
});

module.exports = app;
