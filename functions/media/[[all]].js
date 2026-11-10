export async function onRequestGet(context) {
  const path = new URL(context.request.url).pathname.replace(/^\/media\//, "");
  if (!path) {
    return new Response("Not found", { status: 404 });
  }

  const object = await context.env.MEDIA.get(path);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
