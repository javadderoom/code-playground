import { cors } from "hono/cors";

export const corsMiddleWare = cors({
    origin: 'http://localhost:3000', // Allow your Nuxt frontend
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
})