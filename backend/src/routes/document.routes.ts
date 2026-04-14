import { Router } from 'express';
import multer from 'multer';
import { analyzeDocument } from '../controllers/document.controller.js';
import { analyzeDocumentAdvanced } from '../controllers/advanced-analysis.controller.js';
import { analyzeDocumentFree } from '../controllers/free-analysis.controller.js';
import { analyzeDocumentUnified } from '../controllers/unified-analysis.controller.js';

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
    } else {
      cb(new Error(`Formato no válido. El servidor recibió: ${file.mimetype}`));
    }
  }
});

// Endpoint: POST /documents/analyze (Google Cloud - sin datos simulados)
router.post('/analyze', upload.single('document'), analyzeDocument);

// Endpoint: POST /documents/analyze-free (Solo Tesseract.js - 100% Gratuito)
router.post('/analyze-free', upload.single('document'), analyzeDocumentFree);

// Endpoint: POST /documents/analyze-advanced (Tesseract + Face-api + Cloudinary)
router.post('/analyze-advanced', upload.single('document'), analyzeDocumentAdvanced);

// Endpoint: POST /documents/analyze-unified (OCR + Face-API + Cloud en una sola llamada)
router.post('/analyze-unified', upload.single('document'), analyzeDocumentUnified);

export default router;