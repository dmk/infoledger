import { addEntry, getEntries, verifyEntry } from "../ledger/ledger";
// import { authMiddleware } from "../auth/clerk.js";

export async function handleGetEntries(): Promise<Response> {
  const entries = getEntries();
  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleAddEntry(req: Request): Promise<Response> {
  // const auth = await authMiddleware(req);
  // if (!auth.isSignedIn) {
  //   return new Response(JSON.stringify({error: "Unauthorized"}), {status: 401});
  // }

  const body = await req.json();
  if (!body.entityId || !body.data) {
    return new Response(JSON.stringify({error: "Missing fields"}), {status: 400});
  }

  const entry = addEntry(body.entityId, body.data);
  return new Response(JSON.stringify(entry), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleVerifyEntry(req: Request): Promise<Response> {
  const body = await req.json();
  if (!body.hash) {
    return new Response(JSON.stringify({error: "Missing hash"}), {status: 400});
  }

  const isValid = await verifyEntry(body.hash);
  return new Response(JSON.stringify({ isValid }), {
    headers: { "Content-Type": "application/json" },
  });
}
