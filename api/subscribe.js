export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  }

  const kitRes = await fetch('https://app.kit.com/forms/ca7e16478e/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email_address: email })
  });

  return new Response(JSON.stringify({ ok: kitRes.ok }), {
    status: kitRes.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' }
  });
}