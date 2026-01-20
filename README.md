# Proyecto 6: Aplicación Backend con Autenticación

El objetivo de este proyecto es construir una aplicación backend que administre la autenticación y autorización de los usuarios. Para eso se utilizará MongoDB de BBDD y Mongoose como ODM (Object-Document Mapper) para la persistencia de datos, con un modelo de usuario y un modelo de "producto". Estos modelos estarán relacionados entre sí a través de MongoDB.

También se utilizará OpenAPI y Swagger para documentar la aplicación, y el código seguirá una estructura de carpetas clara con controladores, modelos, rutas y servicios. Finalmente, se desplegará la aplicación a través de render.com y MongoDB Atlas.

# 🛍️ API de Tienda de Perfumes

API REST completa para gestión de perfumes con autenticación JWT, MongoDB y documentación Swagger.

## 📋 Descripción del Proyecto

Esta es una API RESTful construida con Node.js, Express y MongoDB, diseñada para gestionar un sistema completo de comercio electrónico de perfumes. La aplicación implementa autenticación robusta mediante **JSON Web Tokens (JWT)** y `bcryptjs` para el hasheo seguro de contraseñas.

La API expone endpoints para:
- Registrar nuevos usuarios e iniciar sesión
- Gestionar un catálogo de perfumes (CRUD completo)
- Administrar un carrito de compras personalizado por usuario
- Controlar el acceso mediante roles (usuario/administrador)

Una vez autenticados, los usuarios reciben un token JWT que debe ser utilizado como "Bearer Token" para acceder a las rutas protegidas. El sistema implementa dos niveles de acceso:
- **Usuarios regulares**: Pueden ver productos, gestionar su carrito y actualizar su perfil
- **Administradores**: Pueden crear, actualizar y eliminar productos del catálogo

## 🎯 Objetivos de Aprendizaje Alcanzados

✅ **Autenticación y Autorización**: Implementación completa de JWT con diferentes niveles de acceso (roles)

✅ **MongoDB y Mongoose**: Modelado de datos con esquemas, validaciones, relaciones entre documentos y operaciones CRUD

✅ **Arquitectura Backend**: Estructura clara separando configuración, modelos, controladores, rutas y middlewares

✅ **Documentación OpenAPI/Swagger**: API completamente documentada con interfaz interactiva para pruebas

✅ **Seguridad**: Encriptación de contraseñas, validación de tokens, manejo de errores y protección de rutas

✅ **Buenas Prácticas**: Uso de variables de entorno, manejo centralizado de errores, validaciones de datos

## 🛠️ Tecnologías Utilizadas

- **Node.js (v14+)**: Entorno de ejecución de JavaScript
- **Express.js**: Framework web para la construcción del servidor y ruteo
- **MongoDB Atlas**: Base de datos NoSQL en la nube para persistencia de datos
- **Mongoose**: ODM para modelar y facilitar la interacción con MongoDB
- **JSON Web Tokens (JWT)**: Para generación y verificación de tokens de sesión
- **bcryptjs**: Para hasheo y comparación segura de contraseñas
- **dotenv**: Para manejo de variables de entorno
- **CORS**: Para habilitar peticiones cross-origin
- **Swagger UI Express & Swagger JSDoc**: Para documentación interactiva de la API

## 📁 Estructura del Proyecto

```
src/
├── server.js                 # Punto de entrada de la aplicación
├── config/
│   ├── db.config.js         # Configuración de conexión a MongoDB
│   ├── env.config.js        # Gestión de variables de entorno
│   └── swagger.config.js    # Configuración de Swagger/OpenAPI
├── models/
│   ├── userModel.js         # Esquema de Usuario con validaciones
│   ├── perfumeModel.js      # Esquema de Perfume
│   └── cartModel.js         # Esquema de Carrito con relaciones
├── controllers/
│   ├── userController.js    # Lógica de negocio para usuarios
│   ├── perfumeController.js # Lógica de negocio para perfumes
│   └── cartController.js    # Lógica de negocio para carritos
├── middlewares/
│   ├── authMiddleware.js    # Autenticación JWT y autorización
│   └── errorHandler.js      # Manejo centralizado de errores
└── routers/
    ├── userRoutes.js        # Rutas de autenticación y usuarios
    ├── perfumeRoutes.js     # Rutas de productos
    └── cartRoutes.js        # Rutas del carrito
```

## 🚀 Instalación y Ejecución Local

### Requisitos Previos
- Node.js v14 o superior
- Cuenta en MongoDB Atlas
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd proyecto6-backend-auth
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   # Configuración del servidor
   PORT=3000
   NODE_ENV=development

   # Configuración de MongoDB Atlas
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/perfume-shop?retryWrites=true&w=majority

   # Configuración de JWT
   JWT_SECRET=tu_clave_secreta_muy_segura_y_larga
   JWT_EXPIRE=7d

   # Configuración de CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Configurar MongoDB Atlas:**
   - Crear una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crear un nuevo cluster
   - Configurar el acceso a la red (añadir tu IP o permitir desde cualquier lugar: 0.0.0.0/0)
   - Crear un usuario de base de datos
   - Obtener el connection string y actualizarlo en `.env`

5. **Iniciar el servidor:**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev

   # Modo producción
   npm start
   ```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de Endpoints

La API está completamente documentada con Swagger UI. Acceder a:
```
http://localhost:3000/api-docs
```

### 🔐 Autenticación de Usuarios (`/api/user`)

| Método | Endpoint | Descripción | Autenticación | Rol Requerido |
|--------|----------|-------------|---------------|---------------|
| **POST** | `/register` | Registra un nuevo usuario | No | - |
| **POST** | `/login` | Inicia sesión y devuelve token JWT | No | - |
| **GET** | `/verifytoken` | Verifica validez del token | Sí | User/Admin |
| **PUT** | `/update` | Actualiza información del usuario | Sí | User/Admin |

**Body para Registro:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "role": "user"
}
```

**Body para Login:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuesta exitosa (Login/Register):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "createdAt": "2026-01-19T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 🛍️ Gestión de Productos (`/api/product`)

| Método | Endpoint | Descripción | Autenticación | Rol Requerido |
|--------|----------|-------------|---------------|---------------|
| **POST** | `/create` | Crea un nuevo perfume | Sí | Admin |
| **GET** | `/readall` | Lista todos los perfumes (con filtros) | No | - |
| **GET** | `/readone/:id` | Obtiene detalles de un perfume | No | - |
| **PUT** | `/update/:id` | Actualiza un perfume | Sí | Admin |
| **DELETE** | `/delete/:id` | Elimina un perfume (soft delete) | Sí | Admin |

**Filtros disponibles en `/readall`:**
- `category`: Filtrar por categoría (Hombre/Mujer/Unisex)
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo
- `search`: Buscar por nombre o marca

**Body para Crear Perfume:**
```json
{
  "name": "Chanel No. 5",
  "brand": "Chanel",
  "description": "Fragancia floral clásica",
  "price": 150.00,
  "stock": 50,
  "category": "Mujer",
  "image": "https://example.com/perfume.jpg"
}
```

### 🛒 Gestión del Carrito (`/api/cart`)

| Método | Endpoint | Descripción | Autenticación | Rol Requerido |
|--------|----------|-------------|---------------|---------------|
| **GET** | `/` | Obtiene el carrito del usuario | Sí | User/Admin |
| **POST** | `/add` | Agrega un producto al carrito | Sí | User/Admin |
| **PUT** | `/update/:perfumeId` | Actualiza cantidad de un producto | Sí | User/Admin |
| **DELETE** | `/remove/:perfumeId` | Elimina un producto del carrito | Sí | User/Admin |
| **DELETE** | `/clear` | Vacía el carrito completo | Sí | User/Admin |

**Body para Agregar al Carrito:**
```json
{
  "perfumeId": "507f1f77bcf86cd799439012",
  "quantity": 2
}
```

**Respuesta del Carrito:**
```json
{
  "success": true,
  "data": {
    "user": "507f1f77bcf86cd799439011",
    "items": [
      {
        "perfume": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Chanel No. 5",
          "price": 150.00
        },
        "quantity": 2,
        "price": 150.00
      }
    ],
    "totalItems": 2,
    "totalPrice": 300.00
  }
}
```

## 🔒 Sistema de Autenticación

### Flujo de Autenticación

1. **Registro**: El usuario crea una cuenta proporcionando nombre, email y contraseña
2. **Hasheo**: La contraseña se encripta automáticamente con bcrypt (10 salt rounds)
3. **Login**: El usuario inicia sesión con email y contraseña
4. **Verificación**: El sistema compara la contraseña hasheada
5. **Token**: Si es válido, genera un JWT con duración de 7 días
6. **Autorización**: El token debe incluirse en el header `Authorization: Bearer <token>`

### Uso del Token en Peticiones

```bash
curl -X GET \
  "http://localhost:3000/api/user/verifytoken" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Verificación en Swagger

1. Realizar login en `/api/user/login`
2. Copiar el token de la respuesta
3. Hacer clic en el botón **"Authorize"** 🔓 (esquina superior derecha)
4. Ingresar: `Bearer <tu_token>`
5. Todos los endpoints protegidos usarán automáticamente el token

## 🔑 Sistema de Roles y Permisos

| Acción | Usuario Regular | Administrador |
|--------|-----------------|---------------|
| Ver perfumes | ✅ | ✅ |
| Crear perfumes | ❌ | ✅ |
| Actualizar perfumes | ❌ | ✅ |
| Eliminar perfumes | ❌ | ✅ |
| Gestionar carrito propio | ✅ | ✅ |
| Actualizar perfil propio | ✅ | ✅ |

## 🗄️ Modelos de Datos

### Usuario (User)
```javascript
{
  name: String (requerido, 2-50 caracteres),
  email: String (requerido, único, formato email),
  password: String (requerido, hasheado, min 6 caracteres),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Perfume (Perfume)
```javascript
{
  name: String (requerido, max 100 caracteres),
  brand: String (requerido),
  description: String (requerido, max 500 caracteres),
  price: Number (requerido, min: 0),
  stock: Number (requerido, min: 0, default: 0),
  category: String (enum: ['Hombre', 'Mujer', 'Unisex']),
  image: String (URL),
  createdBy: ObjectId (ref: 'User', requerido),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Carrito (Cart)
```javascript
{
  user: ObjectId (ref: 'User', requerido, único),
  items: [{
    perfume: ObjectId (ref: 'Perfume'),
    quantity: Number (min: 1),
    price: Number
  }],
  totalItems: Number (calculado automáticamente),
  totalPrice: Number (calculado automáticamente),
  isActive: Boolean (default: true),
  timestamps: true
}
```

## ⚠️ Manejo de Errores

La API implementa manejo centralizado de errores con mensajes descriptivos:

**Error 400 - Bad Request:**
```json
{
  "success": false,
  "message": "El email es obligatorio"
}
```

**Error 401 - No Autorizado:**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Error 403 - Prohibido:**
```json
{
  "success": false,
  "message": "El rol user no tiene permiso para acceder a esta ruta"
}
```

**Error 404 - No Encontrado:**
```json
{
  "success": false,
  "message": "Perfume no encontrado"
}
```

## 🚢 Despliegue en Producción

### Render.com

1. Crear cuenta en [Render.com](https://render.com)
2. Conectar repositorio de GitHub
3. Crear un nuevo **Web Service**
4. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Agregar variables de entorno en Render:
   ```
   MONGODB_URI=tu_connection_string_de_atlas
   JWT_SECRET=tu_clave_secreta_segura
   JWT_EXPIRE=7d
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.com
   ```

6. Desplegar

### MongoDB Atlas (Producción)

1. En MongoDB Atlas, ir a **Network Access**
2. Agregar IP: `0.0.0.0/0` (permitir acceso desde cualquier IP)
3. Asegurar que el usuario tenga permisos de lectura/escritura

## 🧪 Ejemplos de Uso con cURL

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "password": "Password123!",
    "role": "admin"
  }'
```

### Crear Perfume (requiere token de admin)
```bash
curl -X POST http://localhost:3000/api/product/create \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dior Sauvage",
    "brand": "Dior",
    "description": "Fragancia fresca y amaderada",
    "price": 120,
    "stock": 30,
    "category": "Hombre"
  }'
```

### Buscar Perfumes por Precio
```bash
curl -X GET "http://localhost:3000/api/product/readall?minPrice=100&maxPrice=200"
```

### Agregar al Carrito
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer <TOKEN_USER>" \
  -H "Content-Type: application/json" \
  -d '{
    "perfumeId": "507f1f77bcf86cd799439012",
    "quantity": 1
  }'
```

## 📝 Validaciones Implementadas

### Usuario
- Email: Formato válido y único
- Contraseña: Mínimo 6 caracteres
- Nombre: 2-50 caracteres

### Perfume
- Precio: No puede ser negativo
- Stock: No puede ser negativo
- Categoría: Debe ser Hombre, Mujer o Unisex
- Descripción: Máximo 500 caracteres

### Carrito
- Cantidad: Mínimo 1
- Stock: Valida disponibilidad antes de agregar
- Relaciones: Verifica que perfume y usuario existan

## 🛡️ Características de Seguridad

✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)

✅ Tokens JWT con expiración configurable

✅ Validación de entrada en todos los endpoints

✅ Protección contra inyección SQL mediante Mongoose

✅ Headers CORS configurables

✅ Soft delete para mantener integridad referencial

✅ Middleware de autenticación y autorización

✅ Variables de entorno para datos sensibles

## 🐛 Solución de Problemas Comunes

### Error de Conexión a MongoDB
- Verificar que la IP esté en la whitelist de Atlas
- Confirmar credenciales en el connection string
- Revisar que el usuario tenga permisos correctos

### Token Inválido
- Verificar que el token no haya expirado
- Incluir "Bearer " antes del token
- Confirmar que JWT_SECRET sea el mismo

### Error 403 (Forbidden)
- Verificar que el usuario tenga el rol correcto
- Para crear perfumes se requiere rol "admin"

### Productos no se muestran
- Verificar que `isActive: true`
- Confirmar que existan productos en la BD

## 📊 Características Técnicas Destacadas

- **ES6 Modules**: Uso de `import/export` en lugar de CommonJS
- **Async/Await**: Manejo moderno de asincronía
- **Middleware Chain**: Validación y autenticación en capas
- **Mongoose Hooks**: Pre-save para hasheo de contraseñas
- **Mongoose Methods**: Métodos personalizados en modelos
- **Mongoose Virtuals**: Cálculo automático de totales en carrito
- **Population**: Relaciones entre documentos con populate
- **Indexación**: Índices en campos frecuentemente consultados
- **Validación de Esquemas**: Validaciones nativas de Mongoose

## 📖 Documentación Adicional

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Express.js Docs](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Swagger Docs](https://swagger.io/docs/)

## 👨‍💻 Autor

Proyecto desarrollado como parte del curso de Desarrollo Full Stack

## 📄 Licencia

ISC

---

**Nota**: Este proyecto es con fines educativos y demostrativos. Para uso en producción, considerar implementar características adicionales como rate limiting, logging avanzado, y pruebas automatizadas.