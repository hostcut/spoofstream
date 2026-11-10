export async function onRequestGet(context) {
  const listed = await context.env.MEDIA.list({
    prefix: "videos/",
    limit: 100,
  });

  const videos = (listed.objects || [])
    .filter((obj) => /\.(mp4|webm|mov)$/i.test(obj.key))
    .map((obj) => {
      const file = obj.key.slice("videos/".length); // e.g. my-first-parody.mp4
      const id = file.replace(/\.[^.]+$/, ""); // my-first-parody
      const title = id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        id,
        title,
        key: obj.key,
        url: `/media/${obj.key}`,
        thumb: `/media/thumbs/${id}.jpg`,
        size: obj.size,
        uploaded: obj.uploaded,
      };
    })
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  return Response.json(
    { videos },
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=30",
      },
    }
  );
}
