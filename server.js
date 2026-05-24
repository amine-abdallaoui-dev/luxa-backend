const dotenv = require("dotenv").config();

const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser")

const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { dbConnect } = require("./utils/dbConnect");

app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
  credentials : true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}))

// app.options(/.*/, cors());
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "http://localhost:5175",
// ];
//
// app.use(cors({
//   origin: function (origin, callback) {
//     // Permet aussi les requêtes sans origine (comme Postman)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Bloqué par CORS : Origine non autorisée.'));
//     }
//   },
//   credentials: true // Optionnel : à laisser si vous utilisez des cookies/sessions
// }));
// app.use(bodyParser).json();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;

app.use("/api", require("./routes/adminAuthRoutes"));
app.use("/api", require("./routes/sellerAuthRoutes"));
app.use("/api", require("./routes/customerAuthRoutes"));
app.use("/api", require("./routes/categories"));
app.use("/api", require("./routes/productsRoutes"));
app.use("/api", require("./routes/shopRoutes"));
app.use("/api", require("./routes/ordersRoutes"));
app.use("/api", require("./routes/adminDataRoutes"));
app.use("/api", require("./routes/checkoutRoutes"));
app.use("/api", require("./routes/wishlistRoutes"));
app.use("/api", require("./routes/paymentRoutes"));
// --- GLOBAL ERROR CATCHER (Add this right before http.createServer) ---
app.use((err, req, res, next) => {
  console.error("CRASH DETECTED:", err.stack);
  res.status(500).json({ error: err.message });
});
const server = http.createServer(app);
dbConnect();
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
