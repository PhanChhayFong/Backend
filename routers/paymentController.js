//modules
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//router
const router = express.Router();
router.get("/stripeapi", (req, res) => {
  const stripeAPIKey = process.env.STRIPE_API_KEY;
  res.status(200).send(stripeAPIKey);
});

router.post("/placeOrder", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
  });
  res.status(200).send({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

// router.post("/checkout", async(req, res) => {
//   stripe.customers
//     .create({
//       email: req.body.stripeEmail,
//       source: req.body.stripeToken,
//       name: req.body.stripeName,
//       address: {
//         line1: "",
//         postal_code: "1256",
//         city: "",
//         state: "",
//         country: "",
//       },
//     })
//     .then((customer) => {
//       return stripe.charges.create({
//         amount: req.body.amount,
//         currency: 'usd',
//         customer: customer.id,
//       });
//     })
//     .then((charge) => {
//       console.log(charge);
//       res.send("Success");
//     })
//     .catch((err) => {
//       res.send(err);
//     });
// });
module.exports = router;
