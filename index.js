const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.set("view engine", "handlebars");

const upload = multer({ dest: "uploads/" });
const port = 3000;

// Import the OpenAI
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

//Sets handlebars configurations (we will go through them later on)
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
  })
);

// Generate image - - Get input
app.get("/", (req, res) => {
  res.render("./partials/index", { layout: "master" });
});

app.post("/", async (req, res) => {
  const data = req.body;

  const response = await openai.createImage({
    prompt: data.queryPrompt,
    n: 1,
    size: "256x256",
  });

  image_url = response.data.data[0].url;

  res.render("./partials/index", {
    layout: "master",
    data: image_url,
  });
});

// Upload image - - Get input
app.get("/get-upload", (req, res) => {
  res.render("./partials/getupload", { layout: "master" });
});

const cpUpload = upload.fields([
  { name: "upload_image", maxCount: 1 },
  { name: "upload_masked_image", maxCount: 1 },
]);

app.post("/get-upload", cpUpload, async function (req, res, next) {
  const response = await openai.createImageEdit(
    fs.createReadStream(req.files.upload_image[0].path),
    fs.createReadStream(req.files.upload_masked_image[0].path),
    req.body.queryPrompt,
    1,
    "256x256"
  );

  fs.unlink(req.files.upload_image[0].path, (err) => {
    if (err) {
      console.log(err);
    }
  });

  fs.unlink(req.files.upload_masked_image[0].path, (err) => {
    if (err) {
      console.log(err);
    }
  });

  image_url = response.data.data[0].url;
  res.render("./partials/getupload", {
    layout: "master",
    data: image_url,
    original: req.files.upload_image[0].filename,
    mask: req.files.upload_masked_image[0].filename,
  });
});

// Image Variation
app.get("/get-variation", (req, res) => {
  res.render("./partials/getvariation", { layout: "master" });
});

app.post(
  "/get-variation",
  upload.single("upload_image"),
  async function (req, res, next) {
    const response = await openai.createImageVariation(
      fs.createReadStream(req.file.path),
      1,
      "256x256"
    );

    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });

    image_url = response.data.data[0].url;
    res.render("./partials/getvariation", {
      layout: "master",
      data: image_url,
    });
  }
);

app.listen(port, () => console.log(`App listening to port ${port}`));
