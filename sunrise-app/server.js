import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/events", eventsRouter);

app.listen(3000, () => console.log("Server running on port 3000"));
