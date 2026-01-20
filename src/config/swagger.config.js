import  { env } from "./env.config.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tienda de Perfumes",
      version: "0.9.0",
      description: "API REST para gestión de perfumes con autenticación JWT",
      contact: {
        name: "Equipo de Desarrollo",
        email: "salemhidd1994@gmail.com",
      },
    },
    servers: [
      {
        url: env.serverURL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/**/*.js"],
};

export default swaggerOptions;