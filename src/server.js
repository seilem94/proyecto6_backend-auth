import express from 'express';
import { env } from './config/env.config.js';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import path from 'path';
import connectDB from './config/db.config.js';
import cartRoutes from "./routers/cartRoutes.js";
import perfumeRoutes from "./routers/perfumeRoutes.js";
import userRoutes from "./routers/userRoutes.js";



const port = env.port;
const serverUrl = env.serverURL;
connectDB();
const swaggerDocs = swaggerJSDoc(swaggerOptions);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/cart", cartRoutes);
app.use("/api/perfumes", perfumeRoutes);
app.use("/api/users", userRoutes);
// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});
app.listen(port, () => {
  console.log(`Servidor corriendo en: ${serverUrl}`)});

export default app;
