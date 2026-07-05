require('dotenv').config();
const connectToDB = require("./src/config/database");
const app = require('./src/app');


const port = 3000;

connectToDB();
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});