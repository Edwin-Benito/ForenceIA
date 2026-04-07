import { Router } from 'express';
import { 
  createSession, 
  getSession, 
  updateSession, 
  deleteSession,
  getSessions
} from '../controllers/session.controller.js';

const router = Router();

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
