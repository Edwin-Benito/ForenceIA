import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { prisma } from "../lib/prisma.js";
import { analyzeExif } from "../utils/exifAnalyzer.js";

const docClient = new DocumentProcessorServiceClient({ apiEndpoint: "us-documentai.googleapis.com" });
const visionClient = new ImageAnnotatorClient();

export const analyzeIdentityDocument = async (imageBuffer: Buffer) => {
  const ocrPath = `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/processors/${process.env.GCP_PROCESSOR_ID}`;

  try {
    console.log("🔍 Iniciando análisis de documento...");
    
    // Crear promesas con timeout de 30 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: análisis excedió 30 segundos")), 30000)
    );

    const analysisPromises = Promise.race([
      Promise.all([
        docClient.processDocument({ name: ocrPath, rawDocument: { content: imageBuffer, mimeType: "image/jpeg" } }),
        visionClient.annotateImage({ image: { content: imageBuffer }, features: [{ type: "FACE_DETECTION" }] }),
        analyzeExif(imageBuffer).catch(() => ({ isSuspicious: false }))
      ]),
      timeoutPromise
    ]);

    const [docResponseObj, visionResultObj, exifResult] = await analysisPromises as any;
    
    console.log("✅ Análisis completado");

    const fullText = docResponseObj[0].document?.text || "";
    const lines = fullText.split("\n").map((l: string) => l.trim());
    
    // Análisis de integridad
    const normalizedText = fullText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const specimenMatch = normalizedText.match(/EXEMPLAR|ESPECIMEN|SAMPLE|SPECIMEN|MUESTRA|EJEMPLO|DRAFT|NOT\s+VALID|VOID/);
    const isSpecimen = !!specimenMatch;
    const specimenType = specimenMatch?.[0] || "";
    const faceConfidence = visionResultObj[0].faceAnnotations?.[0]?.detectionConfidence || 0;
    const curpMatch = (fullText.match(/[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d/) || [])[0];

    // 👤 Extracción de Identidad Mejorada (Pasaportes + Documentos Mexicanos)
    let extractedName = "IDENTIDAD DESCONOCIDA";
    let extractedId = "N/A";

    // Primero intentamos MRZ (pasaportes internacionales)
    const mrzLine = lines.find((l: string) => l.startsWith("P<") || l.includes("<<<<"));
    
    if (mrzLine && mrzLine.includes("<")) {
      // Extracción MRZ
      const parts = mrzLine.split("<<");
      const apellidosRaw = parts[0] ? parts[0].substring(5).replace(/</g, " ").trim() : "";
      const nombresRaw = parts[1] ? parts[1].replace(/</g, " ").trim() : "";
      
      if (apellidosRaw || nombresRaw) {
        extractedName = `${nombresRaw} ${apellidosRaw}`.trim().toUpperCase();
      }

      const mrzLine2 = lines.find((l: string) => l.length >= 43 && !l.startsWith("P<") && l.includes("<<<<"));
      if (mrzLine2) {
        extractedId = mrzLine2.substring(0, 9).replace(/</g, "");
      }
    } else {
      // 🇲🇽 Extracción para documentos mexicanos (INE, pasaporte, cédula)
      
      // Buscar campos INE específicos: NOMBRE, APELLIDO PATERNO, APELLIDO MATERNO
      const nombreIndex = lines.findIndex((l: string) => 
        /^NOMBRE|^nombre|^APELLIDO PATERNO|^apellido paterno/i.test(l.trim())
      );
      
      let fullNameParts: string[] = [];
      
      // Si encontramos "NOMBRE" o "APELLIDO PATERNO", extraer las siguientes líneas
      if (nombreIndex !== -1) {
        // Extraer hasta 3 líneas después (nombre, apellido paterno, apellido materno)
        for (let i = nombreIndex + 1; i <= nombreIndex + 3 && i < lines.length; i++) {
          const line = lines[i]?.trim() || "";
          
          // Saltar líneas que no parecen nombres (números, IDs, etc)
          if (line && 
              !/^\d{10,}/.test(line) && // Sin números secuenciales largos
              !/[<>+*%&]/.test(line) && // Sin caracteres especiales
              line.length > 2 &&
              !/^[0-9]{2,4}$/.test(line)) { // No es fecha corta
            
            // Limpiar caracteres problemáticos manteniendo acentos
            const cleaned = line
              .replace(/\s+/g, " ") // Espacios múltiples a uno
              .replace(/[ºª]/g, "") // Símbolos de género
              .toUpperCase()
              .trim();
            
            if (cleaned && !cleaned.includes("CREDENCIAL") && !cleaned.includes("INSTITUTO")) {
              fullNameParts.push(cleaned);
            }
          }
        }
      }
      
      if (fullNameParts.length > 0) {
        extractedName = fullNameParts.join(" ").trim();
      } else {
        // Fallback: buscar líneas que parecen nombres
        const possibleNameLine = lines.find((l: string) => {
          const hasLetters = /[A-ZÁÉÍÓÚÑ]{3,}/i.test(l);
          const hasNoNumbers = !/\d{4,}/.test(l);
          const hasNoSpecial = !/[<>+*]/g.test(l);
          const isLongEnough = l.length > 10;
          return hasLetters && hasNoNumbers && hasNoSpecial && isLongEnough;
        });
        
        if (possibleNameLine && 
            !possibleNameLine.includes("INSTITUTO") && 
            !possibleNameLine.includes("CREDENCIAL") &&
            !possibleNameLine.includes("NACIONAL")) {
          extractedName = possibleNameLine.toUpperCase().trim();
        }
      }
      
      // Buscar ID/folio en patrones mexicanos
      // Patrón: 2 letras + 9 dígitos (folio INE) o 4 letras + 6 dígitos + 1 letra (CURP sin verificador)
      const folioMatch = fullText.match(/[A-Z]{2}\d{9}|[A-Z]{4}\d{6}[A-Z]/);
      if (folioMatch) {
        extractedId = folioMatch[0];
      }
    }

    // 📋 Extracción de datos adicionales del documento
    let birthDate = "N/A";
    let sex = "N/A";
    let electionKey = "N/A";
    let state = "N/A";
    let issuedDate = "N/A";
    let expiryDate = "N/A";

    // Buscar fecha de nacimiento (formato: DD/MM/YYYY o DD-MM-YYYY)
    const birthDateMatch = fullText.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (birthDateMatch) {
      birthDate = birthDateMatch[0];
    }

    // Buscar sexo (H = Hombre, M = Mujer)
    const sexMatch = fullText.match(/\b[HM]\b(?:\s+|$)/);
    if (sexMatch) {
      sex = sexMatch[0].trim() === "H" ? "Hombre" : sexMatch[0].trim() === "M" ? "Mujer" : "N/A";
    }

    // Buscar clave de elector (8 caracteres alfanuméricos)
    const electionKeyMatch = fullText.match(/[A-Z]{6}\d{8}[A-Z0-9]{2}/);
    if (electionKeyMatch) {
      electionKey = electionKeyMatch[0];
    }

    // Buscar estado (buscar después de "ESTADO" o palabras clave de estados mexicanos)
    const stateKeywords = [
      "AGUASCALIENTES", "BAJA CALIFORNIA", "BAJA CALIFORNIA SUR", "CAMPECHE", "CHIAPAS",
      "CHIHUAHUA", "CDMX", "DURANGO", "GUANAJUATO", "GUERRERO", "HIDALGO", "JALISCO",
      "MÉXICO", "MICHOACÁN", "MORELOS", "NAYARIT", "NUEVO LEÓN", "OAXACA", "PUEBLA",
      "QUERÉTARO", "QUINTANA ROO", "SAN LUIS POTOSÍ", "SINALOA", "SONORA", "TABASCO",
      "TAMAULIPAS", "TLAXCALA", "VERACRUZ", "YUCATÁN", "ZACATECAS"
    ];
    
    const foundState = stateKeywords.find((st: string) => fullText.includes(st));
    if (foundState) {
      state = foundState;
    }

    // Buscar fechas de validez (DD/MM/YYYY)
    const allDates = fullText.match(/\d{2}\/\d{2}\/\d{4}/g);
    if (allDates && allDates.length >= 2) {
      issuedDate = allDates[0];
      expiryDate = allDates[allDates.length - 1];
    }

    let verdict = { status: "FALSO", message: specimenType, color: "red" };
    if (!isSpecimen) {
      if (exifResult.isSuspicious) {
        verdict = { status: "FALSO", message: "Imagen manipulada.", color: "red" };
      } else if (faceConfidence < 0.7) {
        verdict = { status: "FALSO", message: "Rostro inválido.", color: "red" };
      } else {
        verdict = { status: "VERDADERO", message: "Documento auténtico.", color: "emerald" };
      }
    }

    // --- GUARDADO SEGURO ---
    await prisma.audit.create({
      data: {
        fullName: extractedName,
        documentId: extractedId,
        curp: curpMatch || "N/A",
        birthDate: birthDate,
        sex: sex,
        electionKey: electionKey,
        state: state,
        issuedDate: issuedDate,
        expiryDate: expiryDate,
        faceConfidence: Number(faceConfidence),
        isDigitallyAltered: !!exifResult.isSuspicious,
        isSpecimen: !!isSpecimen,
        verdictStatus: verdict.status,
        verdictMessage: verdict.message,
        documentOrigin: isSpecimen ? specimenType : "OFICIAL",
        engineVersion: "ForenseID v7.6"
      }
    });

    return {
      personalInfo: { fullName: extractedName, idNumber: extractedId, curp: curpMatch || "N/A" },
      forensicAnalysis: { faceDetected: faceConfidence > 0.7, isSpecimen, isDigitallyAltered: exifResult.isSuspicious, verdict }
    };
  } catch (error: any) {
    console.error("💥 Error en análisis:", error.message);
    throw error;
  }
};