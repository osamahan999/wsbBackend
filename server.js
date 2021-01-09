const express = require('express')
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());



//initialize connection pool
var pool = require('./config/mysqlConnector');



const userRouter = require("./build/routes/userRouter");
const transactionRouter = require("./build/routes/transactionRouter");
const stockDataRouter = require("./build/routes/stockDataRouter");


app.use("/user", userRouter);
app.use("/transaction", transactionRouter);
app.use("/stockData", stockDataRouter);





//main page
app.get('/', (req, res) => {
    res.send("You reached the WallstreetBets Tycoon Backend!");
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});