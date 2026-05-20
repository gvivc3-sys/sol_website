export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    // Resolve @realsolbrah handle to channel ID via channel page
    const pageRes = await fetch('https://www.youtube.com/@realsolbrah', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
    });
    const html = await pageRes.text();
    const idMatch = html.match(/"channelId":"(UC[\w-]+)"/);
    if (!idMatch) throw new Error('channel ID not found');
    const channelId = idMatch[1];

    // Fetch RSS feed
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    const xml = await rssRes.text();

    // Parse latest video
    const videoIdMatch  = xml.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    const titleMatch    = xml.match(/<title>([^<]+)<\/title>/g);
    const publishedMatch = xml.match(/<published>([^<]+)<\/published>/);

    if (!videoIdMatch) throw new Error('no video found');

    const videoId  = videoIdMatch[1];
    const title    = titleMatch?.[1]?.replace(/<\/?title>/g, '') ?? '';
    const published = publishedMatch?.[1] ?? '';

    return new Response(JSON.stringify({ videoId, title, published }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}