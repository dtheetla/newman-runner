import axios from "axios";
import { NewmanRunSummary } from "newman";

interface keyable {
  [key: string]: any;
}
export class SlackService {
  public makeSlackData(result: NewmanRunSummary) {
    const newmanResult: keyable = new Object();
    newmanResult.environment = result.environment.name;
    newmanResult.iterationCount = parseInt(
      result.run.stats.iterations.total + ""
    );
    newmanResult.start = new Date(parseInt(result.run.timings.started + ""));
    newmanResult.end = new Date(parseInt(result.run.timings.completed + ""));
    newmanResult.responseAverage = parseInt(
      result.run.timings.responseAverage + ""
    );
    newmanResult.totalRequests = parseInt(result.run.stats.tests.total + "");
    newmanResult.totalAssertions = parseInt(
      result.run.stats.assertions.total + ""
    );
    newmanResult.failures = parseInt(result.run.failures.length + "");
    newmanResult.time = new Date(newmanResult.end - newmanResult.start)
      .toISOString()
      .slice(11, 19);
    return newmanResult;
  }

  public formatMessage(
    newmanResult: keyable,
    uuid: string,
    tenant: string,
    env: string
  ) {
    return {
      response_type: "in_channel",
      attachments: [
        {
          fallback: "Newman Run Summary",
          title: "Summary Test Result",
          title_link: `${process.env["base_url"]}/results?id=${uuid}`,
          text: `Tenant: ${tenant}\nEnvironment: ${env} \nTotal Run Duration:*${newmanResult.time}`,
          mrkdwn: true,
          fields: [
            {
              title: "No. Of Iterations ",
              value: `${newmanResult.iterationCount}`,
              short: true,
            },
            {
              title: "No. Of Requests",
              value: `${newmanResult.totalRequests}`,
              short: true,
            },
            {
              title: "No. Of Assertions",
              value: `${newmanResult.totalAssertions}`,
              short: true,
            },
            {
              title: "No. Of Failures",
              value: `${newmanResult.failures}`,
              short: true,
            },
            {
              title: "Av. Response Time",
              value: `${newmanResult.responseAverage} ms`,
              short: true,
            },
          ],
        },
      ],
    };
  }

  public async sendInitSlackMessage(urll: string) {
    const webhook_url = urll; //process.env["webhook_url"] + "";
    await axios.post(
      webhook_url,
      { text: "Your Summary Report with you very soon" },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  public async SendReportToSlack(
    result: NewmanRunSummary,
    uuid: string,
    tenant: string,
    env: string,
    webhook_url: string
  ) {
    const nresult = this.makeSlackData(result);
    console.log(nresult);
    const data = this.formatMessage(nresult, uuid, tenant, env);
    await axios.post(webhook_url, data, {
      headers: { "Content-Type": "application/json" },
    });
  }
}
