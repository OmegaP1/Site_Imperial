const mongoose = require("mongoose");
const express = require("express");
const app = express();
const int32 = require("mongoose-int32");
const path = require("path");
const bcrypt = require("bcryptjs");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static("assets"));
app.use(express.json());

mongoose.connect(
  "mongodb+srv://Nba_Tips:Nba_Tips@clusternba.decuk.mongodb.net/imperial?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
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

var UserSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});

const Vinhos = mongoose.model("vinhos", wineSchema);
const User = mongoose.model("user", UserSchema);

module.exports = User;

app.get("/", async function (req, res) {
  await Vinhos.find({}, function (err, vinhos) {
    res.render("Main_Menu.ejs");
  });
});

app.get("/Menu", async function (req, res) {
  res.render("Menu.ejs");
});

app.get("/RegistarVinho", async function (req, res) {
  res.render("RegistarVinho.ejs");
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

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running in 3000");
});

app.get("/login", async function (req, res) {
  res.sendFile(path.join(__dirname + "/login.html"));
});

app.post("/api/register", async (req, res) => {
  console.log(req.body);

  const { username, password: plainTextPassword } = req.body;

  const password = await bcrypt.hash(plainTextPassword, 10);
  console.log(await bcrypt.hash(password, 10));

  try {
    const responde = await User.create({
      username,
      password,
    });
    console.log("User created suc: ", responde);
  } catch (error) {
    console.log(error);
    return res.json({ status: "error" });
  }

  res.json({ stauts: "ok" });
});
