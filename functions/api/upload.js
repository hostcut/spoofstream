export async function onRequestPut(context) {
  const key = new URL(context.request.url).searchParams.get("key");
  if (!key || key.includes("..")) {
    return new Response("Bad key", { status: 400 });
  }

  const type = context.request.headers.get("content-type") || "application/octet-stream";
  if (!type.startsWith("video/") && !type.startsWith("image/")) {
    return new Response("Unsupported type", { status: 415 });
  }

  await context.env.MEDIA.put(key, context.request.body, {
    httpMetadata: { contentType: type },
  });

  return Response.json({ ok: true, url: `/media/${key}` });
}
