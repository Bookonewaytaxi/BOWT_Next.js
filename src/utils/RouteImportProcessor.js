import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const MAX_IMPORT_ROWS = 25000;

const normalizeHeader = (header) => {
  return String(header ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const assertRowLimit = (rows) => {
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new Error(`Import contains ${rows.length.toLocaleString()} rows. Maximum supported in one upload is ${MAX_IMPORT_ROWS.toLocaleString()}.`);
  }
};

/**
 * Parses CSV/XLSX/XLS in the browser and returns normalized raw rows.
 * No database work happens here.
 */
export const parseFile = async (file) => {
  if (!file) throw new Error('No file selected.');

  const extension = String(file.name || '').split('.').pop().toLowerCase();
  if (!['csv', 'xlsx', 'xls'].includes(extension)) {
    throw new Error('Unsupported file type. Please upload a CSV, XLSX, or XLS file.');
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error('File is larger than 25 MB. Please split the route sheet into smaller files.');
  }

  if (extension === 'csv') return parseCSV(file);
  return parseExcel(file);
};

const parseCSV = (file) => new Promise((resolve, reject) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
    complete: (results) => {
      try {
        const cleanData = (results.data || []).filter((row) =>
          Object.values(row || {}).some((value) => String(value ?? '').trim() !== '')
        );
        assertRowLimit(cleanData);
        resolve({
          data: cleanData,
          errors: (results.errors || []).map((e) => `CSV Parse Error: ${e.message}`),
        });
      } catch (error) {
        reject(error);
      }
    },
    error: reject,
  });
});

const parseExcel = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: false,
        dense: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error('Excel file does not contain a worksheet.');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) throw new Error('The first worksheet could not be read.');

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: true,
        blankrows: false,
      });

      const cleanedData = jsonData.map((row) => {
        const normalizedRow = {};
        Object.keys(row || {}).forEach((key) => {
          const cleanKey = normalizeHeader(key);
          if (cleanKey) normalizedRow[cleanKey] = row[key];
        });
        return normalizedRow;
      }).filter((row) =>
        Object.values(row).some((value) => String(value ?? '').trim() !== '')
      );

      assertRowLimit(cleanedData);
      resolve({ data: cleanedData, errors: [] });
    } catch (error) {
      reject(new Error(`Excel parse failed: ${error.message}`));
    }
  };

  reader.onerror = () => reject(new Error('The browser could not read the selected Excel file.'));
  reader.readAsArrayBuffer(file);
});
