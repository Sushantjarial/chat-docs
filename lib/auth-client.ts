import { sso } from "better-auth/plugins/sso";
import { createAuthClient } from "better-auth/react";
import { setFips } from "crypto";
import { setDefaultHighWaterMark } from "stream";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
});
