const mongoose = require("mongoose");
const express = require("express");
const app = express();
const int32 = require("mongoose-int32");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "sadksandsakjnsajfndjsfndsjnfsjasodmasod asmdasodmoadmaosdaskdas323293ewqk";
const read = require("read-css");
var fs = require("fs");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static("assets"));
app.use(express.json());
app.use(express.static("public"));

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

app.listen(process.env.PORT || 30001, function () {
  console.log("Server is running in 30001");
});

app.get("/login", async function (req, res) {
  /*fs.readFile(__dirname + "/css/login.css", function (err, data) {
    if (err) console.log(err);
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(data);
    res.end();
  });*/
  res.sendFile(path.join(__dirname + "/login.html"));
});

app.get("/register", async function (req, res) {
  res.sendFile(path.join(__dirname + "/register.html"));
});

app.get("/change-password", async function (req, res) {
  res.sendFile(path.join(__dirname + "/change-password.html"));
});

app.post("/api/change-password", async (req, res) => {
  const { token, newpassword } = req.body;

  console.log(newpassword);

  if (!newpassword || typeof newpassword !== "string") {
    return res.json({ staus: "Error", error: "Invalid password" });
  }

  if (newpassword.length < 5) {
    console.log("entrei");
    return res.json({
      staus: "Error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const _id = user.id;
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    //erro esta aqui
    //console.log("olaaaa", await User.findOne({ _id })); funciona

    await User.updateOne(
      { _id },
      {
        $set: { password: hashedPassword },
      }
    );

    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: "error", error: "Invalid Username/password" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );
    return res.json({ status: "ok", data: token });
  }
  res.json({ status: "error", error: "Invalid Username/password" });
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof password !== "string") {
    return res.json({ status: "Error", error: "Invalid username" });
  }

  if (!password || typeof password !== "string") {
    return res.json({ status: "Error", error: "Invalid password" });
  }

  if (password.length < 5) {
    console.log("entrei");
    return res.json({
      status: "Error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  try {
    const encrypted_password = await bcrypt.hash(password, 10);
    console.log(await bcrypt.hash(password, 10));
    console.log(req.body);
    const responde = await User.create({
      username,
      password: encrypted_password,
    });
    console.log("User created suc: ", responde);
  } catch (error) {
    if (error.code === 11000) {
      //duplicated key
      return res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }

  res.json({ status: "ok" });
});
