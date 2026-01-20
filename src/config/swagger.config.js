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
      schemas: {
        Perfume: {
          type: "object",
          required: ["name", "brand", "description", "price", "stock", "category"],
          properties: {
            name: {
              type: "string",
              description: "Nombre del perfume",
              maxLength: 100,
            },
            brand: {
              type: "string",
              description: "Marca del perfume",
            },
            description: {
              type: "string",
              description: "Descripción del perfume",
              maxLength: 500,
            },
            price: {
              type: "number",
              description: "Precio del perfume",
              minimum: 0,
            },
            stock: {
              type: "integer",
              description: "Cantidad en stock",
              minimum: 0,
              default: 0,
            },
            category: {
              type: "string",
              enum: ["Hombre", "Mujer", "Unisex"],
              description: "Categoría del perfume",
              default: "Unisex",
            },
            image: {
              type: "string",
              description: "URL de la imagen del perfume",
              default: "https://via.placeholder.com/300x300.png?text=Perfume",
            },
            isActive: {
              type: "boolean",
              description: "Estado del perfume",
              default: true,
            },
          },
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