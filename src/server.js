import express from 'express';
import {port, serverUrl} from './config/env.config.js';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.config.js';
import path from 'path';
import connectDB from './config/db.config.js';

const port = env.port;
const serverUrl = env.serverURL;
connectDB();
const swaggerDocs = swaggerJSDoc(swaggerOptions);

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/pizzas", require("./routes/pizzas"));
app.use("/api/users", require("./routes/users"));


app.listen(port, () => {
  console.log(`Servidor corriendo en: ${serverUrl}`)});

export default app;
