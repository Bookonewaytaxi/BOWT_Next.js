import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parses a file (CSV or Excel) and returns raw data array.
 * DOES NOT VALIDATE or transform data structures heavily.
 * Ensures consistent key naming (trims whitespace from headers).
 */
export const parseFile = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (['xlsx', 'xls'].includes(extension)) {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file type. Please upload a CSV or Excel file.');
  }
};

const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/ /g, '_'), // Normalize headers
      complete: (results) => {
        // Return raw data, filter out completely empty rows
        const cleanData = results.data.filter(row => Object.values(row).some(val => val));
        resolve({ data: cleanData, errors: results.errors.map(e => `CSV Parse Error: ${e.message}`) });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        // defval: "" ensures missing cells are empty strings, not undefined
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); 
        
        // Clean keys: trim and normalize to lowercase snake_case for consistency
        const cleanedData = jsonData.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim().toLowerCase().replace(/ /g, '_');
            newRow[cleanKey] = row[key];
          });
          return newRow;
        });

        resolve({ data: cleanedData, errors: [] });
      } catch (error) {
        reject(new Error("Excel parse failed: " + error.message));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};