const express = require('express');
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require('./connect')
const { restrictToLoggedInUserOnly,
checkAuth } = require("./middlewares/auth");

const URL = require('./models/url');

const staticRoute = require("./routes/staticRouter");
const urlRoute = require('./routes/url');
const userRoute = require("./routes/user");


// EJS Enviornment Setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


// Connect To MongoDB 
connectToMongoDB("mongodb://127.0.0.1/short-url").then(() => {
    console.log("MongoDB Connected.")}).
    catch((error) => {
        consolo.log("MongoDB Error.")
})


// Middleware Plug-IN
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Routes
app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth ,staticRoute);


app.get('/url/:shortId', async(req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, { $push :{
        visitHistory:{
            timestamp: Date.now(),
        }
    }});
    console.log(entry);
    if (!entry) return res.status(404).send("URL can't be Reached.");
    res.redirect(entry.redirectURL);
})


// Server Running
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}.`)
})