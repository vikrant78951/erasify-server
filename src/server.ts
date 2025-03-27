import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./database/connection";
import cookieParser from "cookie-parser";
import { upload } from "./middleware/multer.middleware";
import { CONSTANTS, API_ROUTES } from "./constants/constants";

// Modules
import authRoutes from "./routes/auth.route";
import featureRoute from "./routes/feature.route";
import paymentRoute from './routes/payment.route'

// Configuration
dotenv.config();

// Constants
const app: Application = express();
const PORT = process.env.PORT || 3000;
const url = process.env.MONGODB_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CONSTANTS.FRONTEND_URL.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Server working");
});

// Start the HTTPS server
async function startServer() {
  try {
    console.log("Connecting to database...");
    await connection(url);
    console.log("Database connected successfully");

    // Define routes database connection
    app.use(API_ROUTES.AUTH, upload.none(), authRoutes);
    app.use(API_ROUTES.FEATURES, featureRoute);
    app.use(API_ROUTES.BASE, paymentRoute);

    app.listen(PORT, () => {
      console.log(`Secure server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Database connection error =>", (error as Error).message);
    process.exit(1);
  }
}

startServer();
