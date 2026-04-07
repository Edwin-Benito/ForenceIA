import { Router } from 'express';
import { getAllAudits, getAuditDetail } from '../controllers/audit.controller.js';

const router = Router();

router.get('/', getAllAudits);
router.get('/:id', getAuditDetail);

export default router;