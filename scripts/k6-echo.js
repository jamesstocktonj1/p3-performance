import http from "k6/http";
import { check } from "k6";

// Configuration via environment variables:
//   TARGET_URL   - the endpoint to test (required)
//   BODY_SIZE    - request body size in bytes (default: 1024)
//   VUS          - number of virtual users (default: 10)
//   DURATION     - test duration, e.g. "30s" (default: "30s")
//
// Example:
//   k6 run -e TARGET_URL=http://localhost:8000 -e BODY_SIZE=4096 k6-echo.js

const TARGET_URL = __ENV.TARGET_URL || "http://localhost:8000";
const BODY_SIZE = parseInt(__ENV.BODY_SIZE || "1024", 10);

export const options = {
  vus: parseInt(__ENV.VUS || "10", 10),
  duration: __ENV.DURATION || "30s",
};

// Generate a fixed body of the requested size once, at init time.
const BODY = "0".repeat(BODY_SIZE);

export default function () {
  const res = http.post(TARGET_URL, BODY, {
    headers: { "Content-Type": "text/plain" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response body matches request body": (r) => r.body === BODY,
    "response length matches": (r) => r.body.length === BODY_SIZE,
  });
}
