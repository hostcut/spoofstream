export async function onRequestGet(context) {
  const key = new URL(context.request.url).pathname.replace(/^\/media\//, "");
  if (!key || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const range = context.request.headers.get("range");
  const object = range
    ? await context.env.MEDIA.get(key, { range: context.request.headers })
    : await context.env.MEDIA.get(key);

  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  if (!headers.has("content-type")) {
    if (key.endsWith(".mp4")) headers.set("content-type", "video/mp4");
    else if (key.endsWith(".webm")) headers.set("content-type", "video/webm");
    else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) headers.set("content-type", "image/jpeg");
    else if (key.endsWith(".png")) headers.set("content-type", "image/png");
  }

  const status = object.range ? 206 : 200;
  return new Response(object.body, { status, headers });
}
