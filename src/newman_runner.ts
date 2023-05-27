import { Request, Response } from "express";
import newman from "newman";
import { SlackService } from "./slack_service";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export class NewmanRunner {
  public async ping(req: Request, res: Response) {
    return res.status(200).send({
      message: "PING SUCCESS",
    });
  }

  public results(req: Request, res: Response) {
    res.sendFile(`${process.cwd()}/newman/report-${req.query["id"]}.html`);
  }

  public run(req: Request, res: Response) {
    const uuid = uuidv4();
    const colFilename =
      process.env[req.query["tenant"] + "_" + req.query["env"] + ""];
    const envFilename =
      process.env[req.query["tenant"] + "_" + req.query["env"] + "_env"];

    const envFile = `${process.env["env_path"]}/${envFilename}`;
    const colFile = `${process.env["col_path"]}/${colFilename}`;

    console.log("ENV and COL FILE ...");
    console.log(envFile);
    console.log(colFile);
    if (!fs.existsSync(colFile)) {
      const msg = "invalid colFile : " + colFilename;
      console.log(msg);
      res.send(msg);
      return;
    }
    if (!fs.existsSync(envFile)) {
      const msg = "invalid envFile : " + envFilename;
      console.log(msg);
      res.send(msg);
      return;
    }

    try {
      newman.run(
        {
          collection: colFile,
          environment: envFile,
          iterationCount: 1,
          reporters: ["junit", "htmlextra", "cli"],
          reporter: {
            htmlextra: {
              export: `./newman/report-${uuid}.html`,
              logs: true,
            },
            junit: {
              export: `./newman/junit-${uuid}.xml`,
            },
          },
        },
        async (err, result) => {
          if (err) {
            throw err;
          }
          console.log("collection run complete!");
          const slackService = new SlackService();
          slackService.SendReportToSlack(
            result,
            uuid,
            req.query["tenant"] + "",
            req.query["env"] + ""
          );
          res.sendFile(`${process.cwd()}/newman/report-${uuid}.html`);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
}
