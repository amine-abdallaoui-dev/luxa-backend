const jwt = require("jsonwebtoken");

module.exports.customerAuthMiddleware = (req, res, next) => {
  const { customer_token } = req.cookies;
  if (!customer_token) {
    return res.status(401).json({ error: "Please login first" });
  }
  try {
    const decoded = jwt.verify(customer_token, process.env.JWt_SECRET_KEY);
    if (decoded) {
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
