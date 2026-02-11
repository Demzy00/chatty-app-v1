import express from "express";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.listen(PORT, () =>
  console.log(`Server connected and running on port ${PORT}`),
);
