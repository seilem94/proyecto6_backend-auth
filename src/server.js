import express from "express";
import { env } from "./config/env.config.js";
import cors from "cors";
import connectDB from "./config/db.config.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger.config.js";

import cartRoutes from "./routes/cartRoutes.js";
import perfumeRoutes from "./routes/perfumeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const port = env.port;
const serverUrl = env.serverURL;

const app = express();

// ── IMPORTANTE: el webhook de Stripe necesita el body RAW (Buffer), no JSON.
// Por eso se registra ANTES de express.json().
// La ruta /api/orders/webhook tiene su propio middleware express.raw() en orderRoutes.js
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// Middlewares globales
app.use(express.json());
app.use(cors({ origin: env.cors.origin }));
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  await connectDB();
  const swaggerDocs = swaggerJSDoc(swaggerOptions);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.get("/", (req, res) => {
    res.json({
      message: "🛍️ Bienvenido a la API de Tienda de Perfumes",
      version: "1.0.0",
      documentation: "/api-docs",
      endpoints: {
        users: "/api/users",
        products: "/api/perfumes",
        cart: "/api/cart",
        orders: "/api/orders",
      }
    });
  });

  app.use("/api/cart", cartRoutes);
  app.use("/api/perfumes", perfumeRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/orders", orderRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Servidor corriendo en: ${serverUrl}`);
    console.log(`Documentación disponible en ${serverUrl}/api-docs`);
  });
};

startServer();

export default app;