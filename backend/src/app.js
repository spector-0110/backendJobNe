// src/app.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import jobseekerRoutes from "./routes/jobseeker.routes.js";
import employerRoutes from "./routes/employer.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

// security + parsers
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// rate-limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});
app.use("/api/auth", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/jobseeker", jobseekerRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;