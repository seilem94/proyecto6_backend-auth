import path from "path";
import { serverUrl } from "./env.config.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pizza Restaurant API",
      version: "1.0.0",
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

export default swaggerOptions;