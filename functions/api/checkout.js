export async function onRequestPost(context) {
  const { env } = context;

  const params = new URLSearchParams();
  params.append('payment_method_types[]', 'card');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][product_data][name]', 'A Personal Email from Amrit');
  params.append('line_items[0][price_data][unit_amount]', '1');
  params.append('line_items[0][quantity]', '1');
  params.append('mode', 'payment');
  params.append('success_url', 'https://www.amritsridhar.com/success');
  params.append('cancel_url', 'https://www.amritsridhar.com/cancel');

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
