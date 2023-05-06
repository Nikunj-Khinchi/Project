const express = require("express");
const app = express();
const request = require("request");
const mongoose = require("mongoose");

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/Quad",
    { useUnifiedTopology: true },
    { useCreateIndex: true }
  )
  .then(() => {
    console.log("Connect Succesfully");
  })
  .catch((err) => {
    console.log(err);
  });

const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  vloume: String,
  base_unit: String,
});

const Ticker = mongoose.model("Ticker", tickerSchema);

app.get("/", (req, res) => {
  request("https://api.wazirx.com/api/v2/tickers", (error, response, body) => {
    if (error) {
      console.error(error);
    } else {
      const data = JSON.parse(body);

      const values = Object.values(data);
      const result = values.map((value) => JSON.stringify(value));

      result.sort((a, b) => {
        const objA = JSON.parse(a);
        const objB = JSON.parse(b);
        return objB.high - objA.high;
      });

      const TopTen = result.slice(0, 10);

      TopTen.forEach((elemet) => {
        const data = JSON.parse(elemet);
        const ticker = new Ticker({
          name: data.name,
          last: data.last,
          buy: data.buy,
          sell: data.sell,
          vloume: data.vloume,
          base_unit: data.base_unit,
        });

        Ticker.find({})
          .then((items) => {
            if (items.length === 0) {
              ticker
                .save()
                .then(() => {
                  console.log("Saved ticker:", ticker);
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              console.log("Data Already exists");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });

      Ticker.find({})
        .then((itemss) => {
          console.log();
          let item = itemss.sort(itemss.buy);
          res.render("pages/index.ejs", { result: item });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
