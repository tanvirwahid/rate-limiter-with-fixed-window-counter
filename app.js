const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');

require('dotenv').config();

const express = require("express");
const redis = require("redis");
const app = express();

app.use(rateLimitMiddleware.handle);

app.get("/ok", (req, res) => {
    res.send("ok");
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
