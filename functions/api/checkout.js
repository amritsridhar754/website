const PRODUCTS = {
  email: {
    name: 'A Personal Email from Amrit',
    payment: 50,
    monthly: 60,
    yearly: 70,
  },
  'emoji-email': {
    name: 'A Personal Email from Amrit 🎉',
    payment: 100,
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
  const productConfig = PRODUCTS[product];

  if (!productConfig) {
    return new Response(JSON.stringify({ error: 'Unknown product' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const params = new URLSearchParams();
  params.append('success_url', 'https://www.amritsridhar.com/success');
  params.append('cancel_url', 'https://www.amritsridhar.com/cancel');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][product_data][name]', productConfig.name);
  params.append('line_items[0][quantity]', '1');

  if (mode === 'payment') {
    params.append('mode', 'payment');
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][unit_amount]', String(productConfig.payment));
  } else if (mode === 'monthly') {
    params.append('mode', 'subscription');
    params.append('line_items[0][price_data][unit_amount]', String(productConfig.monthly));
    params.append('line_items[0][price_data][recurring][interval]', 'month');
  } else if (mode === 'yearly') {
    params.append('mode', 'subscription');
    params.append('line_items[0][price_data][unit_amount]', String(productConfig.yearly));
    params.append('line_items[0][price_data][recurring][interval]', 'year');
  } else {
    return new Response(JSON.stringify({ error: 'Unknown mode' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
