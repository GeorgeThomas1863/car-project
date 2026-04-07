//winner gateway

//car is pretty

//put all css in main file

import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

import express from "express";
import session from "express-session";
import routes from "./routes/router.js";
import { buildSessionConfig } from "./middleware/session-config.js";
import { dbConnect } from "./middleware/db-config.js";

// import { uploadErrorHandler } from "./middleware/upload-error.js";

const app = express();

app.use(session(buildSessionConfig()));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//routes
app.use(routes);

//needed for file upload
// app.use(uploadErrorHandler);

await dbConnect();
app.listen(process.env.PORT);
