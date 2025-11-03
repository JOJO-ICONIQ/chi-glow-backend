# chi-glow-backend
const express = require('express');
const stripe = require('stripe')('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'); // Your fresh key, yas
const app = express();
app.use(express.json());

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'your_whsec_here'); // Plug webhook secret
  } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Fulfill order: Update Firebase, send email, etc.
    console.log(`Payment success for ${session.customer_email}! Cha-ching 💸`);
    // AI agent trigger: Auto-restock or upsell via email
  }
  res.json({received: true});
});

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: 'price_1YourPriceIdHere', quantity: 1 }], // From dashboard: Fashion bundle or hair sub
    mode: 'subscription', // Recurring magic
    success_url: 'https://yourhott Site.com/success',
    cancel_url: 'https://yourhott_site.com/cancel',
  });
  res.json({ id: session.id });
});

app.listen(3000, () => console.log('Server slaying on 3000'));
