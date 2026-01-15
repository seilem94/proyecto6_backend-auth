import path from "path";
import { serverUrl } from "./env.config.js";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tienda de Perfumes",
      version: "0.9.0",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-auth-token",
        },
      },
    },
  },
  apis: [`${path.join(__dirname, "./routes/*.js")}`],
};

 