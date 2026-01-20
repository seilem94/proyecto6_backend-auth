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
        email: "dev@dev.com",
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
        User: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              description: "Nombre de usuario",
              maxLength: 50,
            },
            email: {
              type: "string",
              description: "Correo electrónico del usuario",
              format: "email",
            },
            password: {
              type: "string",
              description: "Contraseña del usuario",
              minLength: 6,
            },
            role: {
              type: "string",
              description: "Rol del usuario",
              enum: ["user", "admin"],
              default: "user",
            },
          },
        },
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
        Cart: {
          type: "object",
          required: ["user", "items"],
          properties: {
            user: {
              type: "string",
              description: "ID del usuario dueño del carrito",
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
              description:
                "Lista de ítems en el carrito de compras.",
            },
            totalItems: {
              type: "integer",
              description:
                "Total de ítems en el carrito.",
            },
            totalPrice: {
              type: "number",
              description:
                "Precio total del carrito.",
            },
          },
        },
        CartItem: {
          type: "object",
          required: ["perfume", "quantity", "price"],
          properties: {
            perfume: {
              type: "string",
              description: "ID del perfume",
            },
            quantity: {
              type: "integer",
              description: "Cantidad del perfume",
              minimum: 1,
            },
            price: {
              type: "number",
              description: "Precio del perfume",
              minimum: 0,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ]
  },
  apis: ["./src/**/*.js"],
};

export default swaggerOptions;