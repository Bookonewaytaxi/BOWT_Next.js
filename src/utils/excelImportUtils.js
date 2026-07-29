import * as XLSX from 'xlsx';

export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Use header: 1 to get array of arrays, which is safer for varying column names
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Remove header row
        const rows = jsonData.slice(1);
        const processedData = validateAndProcessData(rows);
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const validateAndProcessData = (rows) => {
  const validRows = [];
  const invalidRows = [];
  
  rows.forEach((row, index) => {
    // Skip empty rows
    if (row.length === 0 || !row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
      return;
    }

    const errors = [];
    const rowNum = index + 2; // Excel row number (1-based, +1 header)

    // Excel Format:
    // A: Start city (0)
    // B: End City (1)
    // C: Km count (2)
    // D: Sedan Price (3)
    // E: SUV/Ertiga Price (4)
    // F: Kia/Carens Price (5)
    // G: Innova/Crysta Price (6)
    // H: Is Active (7)

    const parsePrice = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const num = Number(String(val).replace(/[^0-9.]/g, ''));
      return isNaN(num) ? null : num;
    };

    const parseActive = (val) => {
      if (val === undefined || val === null || val === '') return true; // Default true
      const s = String(val).toLowerCase().trim();
      return !['no', 'false', '0', 'inactive'].includes(s);
    };
    
    const rawData = {
      from_city: row[0],
      to_city: row[1],
      distance_km: parsePrice(row[2]), // Distance behaves like a number
      sedan_price: parsePrice(row[3]),
      suv_ertiga_price: parsePrice(row[4]),
      kia_carens_price: parsePrice(row[5]),
      innova_crysta_price: parsePrice(row[6]),
      is_active: parseActive(row[7])
    };

    // Validation
    if (!rawData.from_city || String(rawData.from_city).trim().length < 3) {
      errors.push('Start city required (min 3 chars)');
    }
    if (!rawData.to_city || String(rawData.to_city).trim().length < 3) {
      errors.push('End city required (min 3 chars)');
    }
    
    // Numeric checks
    const numFields = [
      { key: 'distance_km', label: 'Distance' },
      { key: 'sedan_price', label: 'Sedan Price' },
      { key: 'suv_ertiga_price', label: 'SUV/Ertiga Price' },
      { key: 'kia_carens_price', label: 'SUV/Carens Price' },
      { key: 'innova_crysta_price', label: 'Crysta Price' }
    ];
    
    numFields.forEach(({ key, label }) => {
      const val = rawData[key];
      if (val === null || val <= 0) {
        errors.push(`${label} is required and must be > 0`);
      }
    });

    const cleanSlug = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const processedRow = {
      from_city: String(rawData.from_city || '').trim(),
      to_city: String(rawData.to_city || '').trim(),
      distance_km: rawData.distance_km,
      sedan_price: rawData.sedan_price,
      suv_ertiga_price: rawData.suv_ertiga_price,
      kia_carens_price: rawData.kia_carens_price,
      innova_crysta_price: rawData.innova_crysta_price,
      is_active: rawData.is_active,
      slug: `${cleanSlug(rawData.from_city)}-to-${cleanSlug(rawData.to_city)}`,
      tempId: Math.random().toString(36).substr(2, 9),
      rowNum
    };

    if (errors.length > 0) {
      invalidRows.push({ ...processedRow, errors });
    } else {
      validRows.push(processedRow);
    }
  });

  return { validRows, invalidRows, total: validRows.length + invalidRows.length };
};