import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js'; // Importante el .js para ESM

const router = Router();

router.get('/', getHealth);

export default router;