import express from 'express';
import {port, serverUrl} from './config/env.config.js';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import path from 'path';
import connectDB from './config/db.config.js';


connectDB();

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = env.port;
const serverUrl = env.serverURL;


app.listen(port, () => {
  console.log(`Servidor corriendo en: ${serverUrl}`)});

export default app;
