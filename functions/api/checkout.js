const PRICES = {
  email: {
    payment: 'price_1TJ2znPBs6ogXsINtyesbeuF',
    monthly: 'price_1TJ31BPBs6ogXsIN8EuDf2tZ',
    yearly:  'price_1TJ31CPBs6ogXsINd0A6uBkr',
  },
  'emoji-email': {
    payment: 'price_1TJ31CPBs6ogXsINknJb4pWZ',
  },
};

export async function onRequestPost(context) {
  const { env, request } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { product, mode } = body;
  const priceId = PRICES[product]?.[mode];

  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Unknown product or mode' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const params = new URLSearchParams();
  params.append('success_url', 'https://www.amritsridhar.com/success');
  params.append('cancel_url', 'https://www.amritsridhar.com/cancel');
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('mode', mode === 'payment' ? 'payment' : 'subscription');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const session = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: session.error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
