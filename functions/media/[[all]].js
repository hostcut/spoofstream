export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  let key = url.pathname.replace(/^\/media\//, "");
  try {
    key = decodeURIComponent(key);
  } catch {
    /* ignore */
  }

  if (!key || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const range = context.request.headers.get("Range");

  let object;
  try {
    object = range
      ? await context.env.MEDIA.get(key, { range: context.request.headers })
      : await context.env.MEDIA.get(key);
  } catch (err) {
    return new Response("R2 error: " + (err && err.message ? err.message : "unknown"), {
      status: 500,
    });
  }

  if (!object) {
    return new Response("Not found: " + key, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  const lower = key.toLowerCase();
  if (!headers.has("content-type") || headers.get("content-type") === "application/octet-stream") {
    if (lower.endsWith(".mp4")) headers.set("content-type", "video/mp4");
    else if (lower.endsWith(".webm")) headers.set("content-type", "video/webm");
    else if (lower.endsWith(".mov")) headers.set("content-type", "video/quicktime");
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) headers.set("content-type", "image/jpeg");
    else if (lower.endsWith(".png")) headers.set("content-type", "image/png");
  }

  const status = range && object.range ? 206 : 200;
  return new Response(object.body, { status, headers });
}
