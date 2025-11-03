https://github.com/JOJO-ICONIQ/chi-glow-backend/tree/main
const express = require('express');
const stripe = require('stripe')('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');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// FIREBASE INIT — PLUG YOUR PROJECT ID BELOW
let firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",  // <--- CHANGE THIS
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}
const db = admin.firestore();

// WEBHOOK — WHSEC PLUGGED
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_Ej6iKxo8z8rKG7r7wYSQOd0PG5iPJqax');
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (['checkout.session.completed', 'invoice.paid'].includes(event.type)) {
    const session = event.data.object;
    console.log(`💸 ${session.amount_total / 100} RMB from ${session.customer_email} — GLOW UP!`);

    // AI AGENT: Save sale
    db.collection('sales').add({
      email: session.customer_email,
      amount: session.amount_total / 100,
      items: session.line_items?.data.map(i => i.description) || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // AI AGENT: Trigger restock scrape
    console.log('AI scraping JD.com for more cyber jackets...');

  } else if (event.type === 'invoice.payment_failed') {
    console.log('Payment failed — AI emailing: Fix card or lose VIP!');
  }

  res.json({received: true});
});

// CREATE SUB / BUNDLE
app.post('/create-checkout-session', async (req, res) => {
  const { priceId, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'wechat_pay'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://yourhott_site.com/success',
      cancel_url: 'https://yourhott_site.com/cancel',
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('ChiGlow webhook LIVE — money incoming 💅'));
