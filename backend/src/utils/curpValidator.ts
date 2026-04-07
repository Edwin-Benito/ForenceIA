export const validateCurp = (curp: string): boolean => {
  if (!curp || curp.length !== 18) return false;
  
  // Expresión regular oficial para validar la estructura geométrica de la CURP
  // 4 Letras | 6 Números (YYMMDD) | H o M | 2 Letras Estado | 3 Consonantes | 1 Alfanumérico | 1 Número
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
  
  return curpRegex.test(curp);
};