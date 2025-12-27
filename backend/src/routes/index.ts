import { Hono } from "hono";

const router = new Hono();

router.get('/', (c) =>{
    return c.json({message: 'Code Playground API is running!'})
})

export default router;