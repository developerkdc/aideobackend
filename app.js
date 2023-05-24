import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.js";

import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import languageRoutes from "./routes/language.js";
import tagRoutes from "./routes/tag.js";
import topicRoutes from "./routes/topic.js";
import contentRoutes from "./routes/content.js";
import { isAuthenticatedUser } from "./middlewares/auth.js";
import cors from "cors";

var app = express();
var api_url = "/api/v1";
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());
// Exception Handling
process.on("uncaughtException", (err) => {
    console.log(`Error:${err.message}`);
    console.log("Shutting down the server due to uncaughtExeption");
    process.exit(1);
});

// Main Routes
app.use(`${api_url}/users`, userRoutes);
app.use(`${api_url}/admin`, isAuthenticatedUser, adminRoutes);
app.use(`${api_url}/language`, isAuthenticatedUser, languageRoutes);
app.use(`${api_url}/tag`, isAuthenticatedUser, tagRoutes);
app.use(`${api_url}/topic`, isAuthenticatedUser, topicRoutes);
app.use(`${api_url}/content`, isAuthenticatedUser, contentRoutes);

//Middlewares
app.use(errorMiddleware);

//Database Connection
const PORT = process.env.PORT;

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    })
    .catch((error) => console.log(`${error} did not connect`));
