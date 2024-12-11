export const corsMiddleware = (response: Response) => {
  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  return new Response(response.body, {
    status: response.status,
    headers: { ...headers, ...response.headers }
  });
};
