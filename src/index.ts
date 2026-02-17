import express from "express";
import routes from "./routes";
import { errorHandler } from "./app/middlewares/errorHandler";

const app = express();
const port = 3000;

const cors = require("cors");

app.use(cors());

app.use(express.json());

app.use(routes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Start app on http://localhost:${port}`);
});
