const OpenAI = require("openai");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const {
  logInteraction,
  getInteractionHistory,
  deleteUploadsFiles,
} = require("../utils/helper");
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const askAssistant = async (req, res) => {
  try {
    const question = req.body.question;
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question },
      ],
      model: "gpt-3.5-turbo",
    });
    console.log(question);
    const ans = completion.choices[0].message.content;
    logInteraction(question, ans);
    res.send(ans);
  } catch (error) {
    console.log(error);
  }
};

function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

// const data1 = readExcelFile("Demo.xlsx");
// const data2 = readExcelFile("Demo2.xlsx");

function readAllExcelFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    console.error(`Directory ${directoryPath} does not exist.`);
    return {};
  }

  const files = fs.readdirSync(directoryPath);
  let combinedData = {};

  files.forEach((file) => {
    if (path.extname(file) === ".xlsx") {
      const filePath = path.join(directoryPath, file);
      const data = readExcelFile(filePath);
      combinedData[file] = data;
    }
  });

  return combinedData;
}

const uploadsDirectory = path.join(__dirname, "../uploads");
const combinedData = readAllExcelFiles(uploadsDirectory);

// console.log(combinedData);

function generatePrompt(question, data) {
  return `You are an assistant with access to the following data:\n\n${JSON.stringify(
    data,
    null,
    2
  )}\n\nBased on this data, answer the following question: ${question}`;
}

// Function to send a message and get a response
async function askQuestion(question, data) {
  const prompt = generatePrompt(question, data);

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

const fileAssistant = async (req, res) => {
  try {
    const files = req.files;
    let question = req.body.question;

    if (!files || files.length === 0) {
      return res.status(400).send("Please upload at least one file.");
    }

    if (!question) {
      return res.status(400).send("Please ask your query");
    }
    if (question.startsWith('"') && question.endsWith('"')) {
      question = question.slice(1, -1);
    }
    const answer = await askQuestion(question, combinedData);

    logInteraction(question, answer);
    res.send(answer);
  } catch (error) {
    console.log(error);
  }
};

// let conversationHistory = [];

const handleMessage = async (req, res) => {
  try {
    const history = getInteractionHistory();
    res.send({ history });
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).send("An error occurred while processing the message.");
  }
};

const deleteFiles = (req, res) => {
  try {
    deleteUploadsFiles(uploadsDirectory);
    res.send("All files have been deleted.");
  } catch (error) {
    res.status(500).send("An error occurred while deleting the files.");
  }
};

module.exports = { askAssistant, fileAssistant, handleMessage, deleteFiles };
