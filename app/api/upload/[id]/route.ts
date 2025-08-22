export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Await params
  console.log(id, "params");

  return new Response(
    JSON.stringify({
      message: "GET request successful",
      request: req.url,
      id
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}