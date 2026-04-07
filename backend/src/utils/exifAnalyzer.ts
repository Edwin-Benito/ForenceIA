import exifr from 'exifr';

export const analyzeExif = async (imageBuffer: Buffer) => {
  try {
    // Pedimos a exifr que busque etiquetas estándar y avanzadas (XMP/TIFF)
    const metadata = await exifr.parse(imageBuffer, { 
      tiff: true, 
      xmp: true, 
      exif: true 
    });

    // Si la imagen fue limpiada de metadatos (como lo hace WhatsApp)
    if (!metadata) {
      return {
        hasMetadata: false,
        softwareDetected: "Desconocido / Metadatos limpios",
        isSuspicious: false
      };
    }

    // Buscamos los campos exactos donde los programas dejan su firma
    const softwareStr = String(metadata.Software || metadata.CreatorTool || metadata.ProcessingSoftware || "");

    // 🏴‍☠️ Lista negra de programas de edición gráfica
    const blacklist = ['photoshop', 'gimp', 'canva', 'illustrator', 'pixelmator', 'coreldraw', 'lightroom'];
    
    let isSuspicious = false;
    const swLower = softwareStr.toLowerCase();
    
    // Si encontramos algún programa de la lista negra, encendemos la alarma
    if (swLower) {
      isSuspicious = blacklist.some(tool => swLower.includes(tool));
    }

    return {
      hasMetadata: true,
      softwareDetected: softwareStr || "Ninguno",
      isSuspicious: isSuspicious
    };

  } catch (error) {
    console.error("⚠️ Error leyendo EXIF:", error);
    // Si la imagen está corrupta en sus metadatos
    return { hasMetadata: false, softwareDetected: "Error de lectura", isSuspicious: false };
  }
};