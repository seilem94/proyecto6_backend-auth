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

const port = env.port;
const serverUrl = env.serverURL;

// Inicializar Express
const app = express();
// Middlewares
app.use(express.json());
app.use(cors({ origin: env.cors.origin }));
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos y configurar Swagger
const startServer = async () => {
  await connectDB();
  const swaggerDocs = swaggerJSDoc(swaggerOptions);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Ruta de bienvenida
  app.get("/", (req, res) => {
    res.json({
      message: "🛍️ Bienvenido a la API de Tienda de Perfumes",
      version: "1.0.0",
      documentation: "/api-docs",
      endpoints: {
        users: "/api/users",
        products: "/api/perfumes",
        cart: "/api/cart"
      }
    });
  });

  app.use("/api/cart", cartRoutes);
  app.use("/api/perfumes", perfumeRoutes);
  app.use("/api/users", userRoutes);
  // Middleware de manejo de errores
  app.use(notFound); // Maneja rutas no encontradas
  app.use(errorHandler); // Maneja errores generales

  app.listen(port, () => {
    console.log(`Servidor corriendo en: ${serverUrl}`);
      console.log(`Documentación disponible en ${serverUrl}/api-docs`);
  });
};

startServer();

export default app;
