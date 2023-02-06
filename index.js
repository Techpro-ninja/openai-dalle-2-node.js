const express = require("express");
const cors = require("cors");

// Import the OpenAI
const { Configuration, OpenAIApi } = require("openai");

// Create a new OpenAI configuration and paste your API key
// obtained from Step 1
// The key displayed here is a fake key
const configuration = new Configuration({
  apiKey: "sk-XXXXXXXTJ4UznFsQoZT3BlbkFJrPieBj36AZkmXXXXXXX",
});
const openai = new OpenAIApi(configuration);

const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "hbs");

const port = 3000;

//Render the input form
app.get("/", (req, res) => {
  res.render("index");
});

// create a post route to receive input data
app.post("/", async (req, res) => {
  const data = req.body;

  // Query the OpenAI API
  let promptContext = `/*
    Javascript application
    ${data.queryPrompt}
    */
    <!DOCTYPE html>
   `;

  const response = await openai.createCompletion({
    model: "code-davinci-002",
    prompt: `${promptContext}`,
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  res.json(response.data.choices[0].text);
});

app.listen(port, () => {
  console.log(`Node server listening at http://localhost:${port}`);
});
