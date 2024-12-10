import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

export async function authMiddleware(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const auth = await clerkClient.authenticateRequest(request, {
    authorizedParties: ["http://localhost"]
  });

  if (!auth.isSignedIn) {
    throw new Error("Unauthorized");
  }

  return auth;
}
