import express from 'express';
import {env} from './config/env.config.js';
import cors from 'cors';

//Objetivo abrir el puerto
const app = express();
app.use(express.json());
app.use(cors());
const {port} = env;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Servidor corriendo en: ${serverUrl}`)});

export default app;
