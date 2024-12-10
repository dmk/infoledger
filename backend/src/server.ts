import { serve } from "bun";
import { handleGetEntries, handleAddEntry, handleVerifyEntry } from "./routes/entries";
import { startVerificationTask } from "./tasks/verification";

console.log("Starting server on port 4891...");

startVerificationTask(15);

serve({
  port: 4891,
  async fetch(req) {
    const url = new URL(req.url);

    console.log(`${req.method} ${url.pathname}`);

    if (url.pathname === "/entries" && req.method === "GET") {
      const response = await handleGetEntries();
      console.log(`Response status: ${response.status}`);
      return response;
    }

    if (url.pathname === "/entries" && req.method === "POST") {
      try {
        const response = await handleAddEntry(req);
        console.log(`Response status: ${response.status}`);
        return response;
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    }

    if (url.pathname === "/verify" && req.method === "POST") {
      const response = await handleVerifyEntry(req);
      console.log(`Response status: ${response.status}`);
      return response;
    }

    console.log(`Not Found: ${url.pathname}`);
    return new Response("Not Found", { status: 404 });
  },
});
