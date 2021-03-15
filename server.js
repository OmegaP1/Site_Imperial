const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const int32 = require("mongoose-int32");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("assets"));

mongoose.connect(
  "mongodb+srv://Nba_Tips:Nba_Tips@clusternba.decuk.mongodb.net/imperial?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection : " + err);
    }
  }
);

numberOfRegioes = 0;
Regioes = [];

var wineSchema = new mongoose.Schema({
  Nome: String,
  Casta: String,
  Teor_Alcoolico: String,
  Preco: String,
  Ano: int32,
  Categoria: String,
  Região: String,
  Descricao1: String,
  Descricao2: String,
});

const Vinhos = mongoose.model("vinhos", wineSchema);

app.get("/", async function (req, res) {
  await Vinhos.find({}, function (err, vinhos) {
    res.render("Main_Menu.ejs");
  });
});

app.get("/Vinhos", async function (req, res) {
  Regioes = [];
  await Vinhos.find({}, function (err, vinhos) {
    for (i = 0; i < vinhos.length; i++) {
      helper = vinhos[i].Região;
      if (Regioes.length == 0) {
        Regioes.push(helper);
      }
      if (
        helper != Regioes[Regioes.length] &&
        helper != Regioes[Regioes.length - 1]
      ) {
        Regioes.push(helper);
      }
    }
    numberOfRegioes = Regioes.length;
    console.log(Regioes);

    res.render("Vinhos.ejs", {
      VinhosList: vinhos,
    });
  }).sort({ Região: 1 });
});

app.post("/Vinhos", async function (req, res) {
  Name = req.body.NomeVinho;
  console.log(Name);
  findable = { Nome: Name };
  await Vinhos.find({}, function (err, vinhos) {
    res.render("DisplayVinhos.ejs", {
      VinhosList: vinhos,
    });
  }).find(findable);
});

app.listen(3000, function () {
  console.log("Server is running in 3000");
});
