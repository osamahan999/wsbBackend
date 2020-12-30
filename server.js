const express = require('express')
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());



//initialize connection pool
var pool = require('./config/mysqlConnector');



const userRouter = require("./routes/user");
app.use("/user", userRouter);









//main page
app.get('/', (req, res) => {
    res.send("You reached the WallstreetBets Tycoon Backend!");
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});