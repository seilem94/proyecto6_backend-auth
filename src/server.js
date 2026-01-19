import express from 'express';
import { env } from './config/env.config.js';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import connectDB from './config/db.config.js';
import cartRoutes from "./routers/cartRoutes.js";
import perfumeRoutes from "./routers/perfumeRoutes.js";
import userRoutes from "./routers/userRoutes.js";
import { errorHandler, notFound } from './middlewares/errorHandler.js'; 


const port = env.port;
const serverUrl = env.serverURL;

const app = express();
app.use(express.json());
app.use(cors());

const startServer = async () => {
  await connectDB();
  const swaggerDocs = swaggerJSDoc(swaggerOptions);

  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use("/api/cart", cartRoutes);
  app.use("/api/perfumes", perfumeRoutes);
  app.use("/api/users", userRoutes);
  // Middleware de manejo de errores
  app.use(notFound);  // Maneja rutas no encontradas
  app.use(errorHandler);  // Maneja errores generales

  app.listen(port, () => {
    console.log(`Servidor corriendo en: ${serverUrl}`);
  });
};

startServer();

export default app;
