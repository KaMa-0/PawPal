import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "PawPal Backend says Hi!" });
});

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});

