// const express = require ('express');
// const cookieParser = require("cookie-parser")
// const cors = require("cors");
// const path = require("path");


// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true
// }))

// /* require all the routes here */

// const authRouter = require ('./routes/auth.routes');
// const interviewRouter = require('./routes/interview.routes');


// /* use all the routes here */
// app.use("/api/auth", authRouter);
// app.use("/api/interview", interviewRouter);

// app.use(express.static(path.join(__dirname, "../public")));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Public", "index.html"));
// });



// module.exports = app;

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://prep-pilot-nu.vercel.app"
    ],
    credentials: true,
}));

// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// Serve React static files
app.use(express.static(path.join(__dirname, "../Public")));

// Catch-all route for React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Public", "index.html"));
});

module.exports = app;