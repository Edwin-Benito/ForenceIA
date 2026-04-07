import { Router } from 'express';
import multer from 'multer';
import { analyzeDocument } from '../controllers/document.controller.js';
const router = Router();
// Configuración de Multer más robusta
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        // LOG DE DEBUG: Esto nos dirá en la terminal qué está llegando
        console.log(`>>> Multer recibió: ${file.originalname} | Mime: ${file.mimetype}`);
        const isImageMime = file.mimetype.startsWith('image/');
        const isImageExt = /\.(jpg|jpeg|png)$/i.test(file.originalname);
        if (isImageMime || isImageExt) {
            cb(null, true);
        }
        else {
            cb(new Error(`Formato no válido. El servidor recibió: ${file.mimetype}`));
        }
    }
});
// Endpoint: POST /documents/analyze
router.post('/analyze', upload.single('document'), analyzeDocument);
export default router;
//# sourceMappingURL=document.routes.js.map