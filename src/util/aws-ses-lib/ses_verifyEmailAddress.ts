import { VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";
import sesClient from "./sesClient";

const params = { EmailAddress: "arkadiptadas989@outlook.com" }

const run = async () => {
  try {
    const data = await sesClient.send(new VerifyEmailIdentityCommand(params));
    console.log("Success.", data);
    return data; // For unit tests.
  } catch (err: any) {
    console.log("Error", err.stack);
  }
};
run();