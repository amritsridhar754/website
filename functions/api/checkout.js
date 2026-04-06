import Stripe from 'stripe';

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

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: mode === 'payment' ? 'payment' : 'subscription',
    success_url: 'https://www.amritsridhar.com/success',
    cancel_url: 'https://www.amritsridhar.com/cancel',
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
