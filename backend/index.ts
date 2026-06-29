import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth.route"; // dòng mới

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Recruitment API is running" });
});

app.use("/api/auth", authRoutes); // dòng mới

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};

startServer();