const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;
const dataDir = path.join(__dirname, "data");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).send("Error reading directory");
    res.render("index", { files });
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", (req, res) => {
  const { filename, content } = req.body;
  const filePath = path.join(dataDir, filename);
  fs.writeFile(filePath, content, (err) => {
    if (err) return res.status(500).send("Error creating file");
    res.redirect("/");
  });
});

app.get("/files/:filename", (req, res) => {
  const filePath = path.join(dataDir, req.params.filename);
  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) return res.status(500).send("Error reading file");
    res.render("detail", { filename: req.params.filename, content });
  });
});

app.post("/update/:filename", (req, res) => {
  const oldFilePath = path.join(dataDir, req.params.filename);
  const { newFilename, content } = req.body;
  const newFilePath = path.join(dataDir, newFilename);
  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) return res.status(500).send("Error renaming file");
    fs.writeFile(newFilePath, content, (err) => {
      if (err) return res.status(500).send("Error updating file");
      res.redirect("/");
    });
  });
});

app.post("/delete/:filename", (req, res) => {
  const filePath = path.join(dataDir, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send("Error deleting file");
    res.redirect("/");
  });
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
