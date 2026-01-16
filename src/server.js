import express from 'express';
import { env } from './config/env.config.js';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import path from 'path';
import connectDB from './config/db.config.js';
import checkoutRoutes from "./routers/cartRoutes.js";
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
app.use("/api/checkout", checkoutRoutes);
app.use("/api/perfumes", perfumeRoutes);
app.use("/api/users", userRoutes);


app.listen(port, () => {
  console.log(`Servidor corriendo en: ${serverUrl}`)});

export default app;
