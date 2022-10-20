const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect('mongodb+srv://redak:redak123@cluster0.awcv0mb.mongodb.net/?retryWrites=true&w=majority');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const listschema = new mongoose.Schema({
    title: String,
})
const listmodel = new mongoose.model("lists", listschema);
const item1 = new listmodel({
    title: "Morning Walk",
});
const item2 = new listmodel({
    title: "Shower",
});
const item3 = new listmodel({
    title: "BreakFast",
});

let items = [item1, item2, item3];


app.get('/', (req, res) => {
    listmodel.find({}, function (err, data) {
        if (data.length === 0) {
            listmodel.insertMany(items, function (err) {
                if (err) {
                    console.log(err);
                }
            })
            res.redirect("/");
        }
        else {
            res.render("index", { list: data, head: "Today" });
        }

    });
})
const pageschema = new mongoose.Schema({
    name: String,
    List: [listschema]
})
const pagemodel = new mongoose.model("pages", pageschema);
app.get("/:page", (req, res) => {
    const pagee = _.capitalize(req.params.page);
    pagemodel.findOne({ name: pagee }, function (err, foundpage) {
        if (!err) {
            if (!foundpage) {
                const pagename = new pagemodel({
                    name: req.params.page,
                    List: items,
                });
                pagename.save();
                res.redirect("/" + pagee);
            } else {
                res.render("index", { list: foundpage.List, head: pagee })
            }
        }
    })

});


app.post('/', (req, res) => {
    const newtitle = req.body.title_name;
    const head = req.body.head;
    const list = new listmodel({
        title: newtitle,
    });
    if (head === "Today") {
        list.save();
        res.redirect("/");
    } else {
        pagemodel.findOne({ name: head }, function (err, add_data) {
            add_data.List.push(list);
            add_data.save();
            res.redirect("/" + head);
        });
    }

})

app.post("/delete", (req, res) => {
    const deletedItem = req.body.deleteitem;
    const deletefrompage = req.body.deletefrompage;
    if (deletefrompage === "Today") {
        listmodel.findByIdAndDelete(deletedItem, function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.redirect("/");
    } else {
        pagemodel.findOneAndUpdate({ name: deletefrompage }, { $pull: { List: { _id: deletedItem } } }, function (err, data) {
            if (!err) {
                res.redirect("/" + deletefrompage);
            }
        });
    }

})
// app.listen(process.env.PORT, () => {
//     console.log('Running on heroku server');
// })
const port = process.env.PORT || 3000;
// app.set("port",PORT);

app.listen(port, () => {
    console.log("App is running on port" + port);
});