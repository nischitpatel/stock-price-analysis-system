// Entry point for the backend server

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import stockRoutes from "./routes/stocks.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/stocks", stockRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
