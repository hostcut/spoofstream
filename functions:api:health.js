export async function onRequest(context) {
  return Response.json({
    ok: true,
    hasDB: !!context.env.DB,
    hasR2: !!context.env.VIDEOS,
  });
}
