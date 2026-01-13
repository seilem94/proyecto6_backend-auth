import express from 'express'
import {env} from './config/env.config.js'

//Objetivo abrir el puerto
const app = express();

const {port} = env;
//const port = 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

//Se instala nodemon para que el servidor se reinicie automaticamente
//npm install nodemon --save-dev (o -D)
//--save-dev se usa solo para usarla como dependencia para desarrollo (y no produccion)

