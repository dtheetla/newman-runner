import http from "http";
import express, { Express } from "express";
import * as bodyParser from "body-parser";
import { NewmanRunner } from "./newman_runner";
require("dotenv").config();

const router: Express = express();
// router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const nr = new NewmanRunner();
router.post("/", nr.runpost);
router.get("/", nr.ping);
router.get("/run", nr.run);
router.get("/results", nr.results);

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 4000;
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
);
