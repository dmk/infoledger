import { serve } from "bun";
import { handleGetEntries, handleAddEntry, handleVerifyEntry } from "./routes/entries";
import { startVerificationTask } from "./tasks/verification";
import { corsMiddleware } from "./middleware/cors";

console.log("Starting server on port 4891...");

startVerificationTask(0.1);

serve({
  port: 4891,
  async fetch(req) {
    try {
      if (req.method === "OPTIONS") {
        return corsMiddleware(new Response(null));
      }

      const url = new URL(req.url);
      console.log(`${req.method} ${url.pathname}`);

      if (url.pathname === "/entries" && req.method === "GET") {
        const response = await handleGetEntries();
        console.log(`Response status: ${response.status}`);
        return corsMiddleware(response);
      }

      if (url.pathname === "/entries" && req.method === "POST") {
        try {
          const response = await handleAddEntry(req);
          console.log(`Response status: ${response.status}`);
          return corsMiddleware(response);
        } catch (error) {
          console.error("Error:", error);
          return corsMiddleware(new Response("Bad Request", { status: 400 }));
        }
      }

      if (url.pathname === "/verify" && req.method === "POST") {
        try {
          const response = await handleVerifyEntry(req);
          console.log(`Response status: ${response.status}`);
          return corsMiddleware(response);
        } catch (error) {
          console.error("Error:", error);
          return corsMiddleware(new Response("Bad Request", { status: 400 }));
        }
      }

      console.log(`Not Found: ${url.pathname}`);
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("Unexpected error:", error);
      return corsMiddleware(new Response("Bad Request", { status: 400 }));
    }
  },
});
