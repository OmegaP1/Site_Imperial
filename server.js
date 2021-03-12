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

  var wineSchema = new mongoose.Schema({
    Nome: String,
    Casta: String,
    Teor_Alcoolico: String,
    Preco: String,
    Ano: int32,
    Descricao1 : String,
    Descricao2 : String,
  });


  const Vinhos = mongoose.model("vinhos", wineSchema);




  app.get("/", async function (req, res) {
    await Vinhos.find({}, function (err, vinhos) {
      res.render("Vinhos.ejs", {
        VinhosList: vinhos,
      });
    }).sort({ Nome: 1 });
  });


  

  


  app.listen(3000, function () {
    console.log("Server is running in 3000");
  });  