import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth.route";
import jobRoutes from "./routes/job.route";
import applicationRoutes from "./routes/application.route";
import candidateJobActivityRoutes from "./routes/candidateJobActivity.route";
import candidateProfileRoutes from "./routes/candidateProfile.route";
import candidatePreferenceRoutes from "./routes/candidatePreference.route";
import companyProfileRoutes from "./routes/companyProfile.route";
import companyLocationRoutes from "./routes/companyLocation.route";
import vietnamLocationRoutes from "./routes/vietnamLocation.route";
import jobInvitationRoutes from "./routes/jobInvitation.route";
import interviewScheduleRoutes from "./routes/interviewSchedule.route";
import offerRoutes from "./routes/offer.route";
import messageRoutes from "./routes/message.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Recruitment API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/job-activities", candidateJobActivityRoutes);
app.use("/api/candidate-profile", candidateProfileRoutes);
app.use("/api/candidate-preference", candidatePreferenceRoutes);
app.use("/api/company-profile", companyProfileRoutes);
app.use("/api/company-locations", companyLocationRoutes);
app.use("/api/vietnam-locations", vietnamLocationRoutes);
app.use("/api/invitations", jobInvitationRoutes);
app.use("/api", interviewScheduleRoutes);
app.use("/api", offerRoutes);
app.use("/api", messageRoutes);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};

startServer();