const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "PUT", "OPTIONS"] },
      { url: /\/api\/v1\/sliders(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/users(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/companys(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      {
        url: /\/api\/v1\/shoppingcarts(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      { url: /\/api\/v1\/users\/active(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/users(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/users\/message(.*)/, methods: ["POST", "OPTIONS"] },
      { url: /\/api\/v1\/users\/chfgPass(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/users\/chPass(.*)/, methods: ["PUT", "OPTIONS"] },
      { url: /\/api\/v1\/orders\/success(.*)/, methods: ["PUT", "OPTIONS"] },

      `${api}/users/login`,
      `${api}/users/fgPassword`,
      `${api}/users/register`,
      `${api}/users/OTP`,
      `${api}/payments/stripeapi`,
      `${api}/payments/placeOrder`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }
  done();
}

module.exports = authJwt;
