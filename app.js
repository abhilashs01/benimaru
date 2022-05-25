//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://appu:appuappu@cluster0.psoeu.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome TO Todolist!",
});
const item2 = new Item({
  name: "Press + To Add Items",
});
const item3 = new Item({
  name: "<-- Hit This To Delete An Item",
});
const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, fitem) {
    if (fitem.length === 0) {
      
      Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          }
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: fitem });
    }
  });
});

app.post("/", (req, res) => {
    const itemname = req.body.newItem;
    const listname = req.body.list;
    const item = Item({
      name: itemname
    });
    if (listname === "today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listname }, (err, folist) => {
        folist.items.push(item);
        folist.save();
        res.redirect("/" + listname);
      });
    }
  });

app.get("/:topic",(req, res) => {
    const tname = _.capitalize(req.params.topic);
    List.findOne({ name: tname }, function (err, flist) {
      if (!err) {
        if (!flist) {
          const list = new List({
            name: tname,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + tname);
        } else {
          res.render("list", { listTitle: flist.name, newListItems: flist.items });
        }
      }
    });

  })


app.get("/about", (req, res) => {
    res.render("about");
  });
app.post("/delete",(req, res) => {
    const a = req.body.citem;
    const b = req.body.listN;
    if (b === "today") {
      Item.findByIdAndRemove(a, (err) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
    } else {
      List.findOneAndUpdate({ name: b }, { $pull: { items: { _id: a } } }, function (err, flist) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + b);
        }
      });
    }

  })

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }
  app.listen(port);
