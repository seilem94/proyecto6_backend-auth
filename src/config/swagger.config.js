import path from "path";
import { serverUrl } from "./env.config.js";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tienda de Perfumes",
      version: "0.9.0",
      description: 'API REST para gestión de perfumes con autenticación JWT',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@perfumeshop.com'
      },
      servers: [
        {
          url: serverUrl,
          description: 'Servidor de Desarrollo'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Ingresa el token JWT obtenido al iniciar sesión'
          }
        },
        schemas: {
          User: {
            type: 'object',
            required: ['name', 'email', 'password'],
            properties: {
              name: {
                type: 'string',
                example: 'Juan Pérez'
              },
              email: {
                type: 'string',
                format: 'email',
                example: 'juan@example.com'
              },
              password: {
                type: 'string',
                format: 'password',
                example: 'Password123!'
              },
              role: {
                type: 'string',
                enum: ['user', 'admin'],
                default: 'user'
              }
            }
          },
          Perfume: {
            type: 'object',
            required: ['name', 'brand', 'price'],
            properties: {
              name: {
                type: 'string',
                example: 'Chanel No. 5'
              },
              brand: {
                type: 'string',
                example: 'Chanel'
              },
              description: {
                type: 'string',
                example: 'Fragancia floral clásica'
              },
              price: {
                type: 'number',
                example: 150.00
              },
              stock: {
                type: 'number',
                example: 50
              },
              category: {
                type: 'string',
                example: 'Mujer'
              },
              image: {
                type: 'string',
                example: 'https://example.com/image.jpg'
              }
            }
          },
          Cart: {
            type: 'object',
            properties: {
              user: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    perfume: {
                      type: 'string',
                      example: '507f1f77bcf86cd799439012'
                    },
                    quantity: {
                      type: 'number',
                      example: 2
                    }
                  }
                }
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    },
    apis: [`${path.join(__dirname, "./routes/*.js")}`]
  }
};