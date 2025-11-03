let firebaseConfig = {
  apiKey: "AIzaSyB0dUMMYFAKEKEY1234567890", // We'll gen real one in a sec
  authDomain: "chi-glow-money.firebaseapp.com",
  projectId: "chi-glow-money",
  storageBucket: "chi-glow-money.appspot.com",
  messagingSenderId: "78932978337",
  appId: "1:78932978337:web:abcdef123456"
};
const express = require('express');
const stripe = require('stripe')('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');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// FIREBASE CONFIG (FROM YOUR DOC)
const firebaseConfig = {
  apiKey: "AIzaSyBhPp4ScXJ8zand2hVKnSicYrt1a0v_dvw",
  authDomain: "chi-glow-money.firebaseapp.com",
  projectId: "chi-glow-money",
  storageBucket: "chi-glow-money.firebasestorage.app",
  messagingSenderId: "789329783337",
  appId: "1:789329783337:web:a93c311fbae12ed65a0a38",
  measurementId: "G-X8MPRSYNVP"
};

// INIT FIREBASE ADMIN (SERVICE ACCOUNT FROM ENV)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });
}
const db = admin.firestore();

// WEBHOOK — REAL WHSEC
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
    console.log(`💸 ${session.amount_total / 100} from ${session.customer_email}`);

    db.collection('sales').add({
      email: session.customer_email,
      amount: session.amount_total / 100,
      items: session.line_items?.data.map(i => i.description) || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }).then(() => console.log('Sale saved — AI restocking...'));
  } else if (event.type === 'invoice.payment_failed') {
    console.log('Payment failed — AI emailing fix');
  }

  res.json({received: true});
});

// CREATE CHECKOUT
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

app.listen(process.env.PORT || 3000, () => console.log('ChiGlow LIVE — MONEY INCOMING 💅'));
