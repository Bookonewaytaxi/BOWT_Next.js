import * as XLSX from 'xlsx';

export const parseRouteFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first sheet is the one we want
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error("File appears to be empty or missing headers");
        }

        // Extract headers (first row)
        const headers = jsonData[0].map(h => (h || '').toString().trim().toLowerCase());
        const rows = jsonData.slice(1);

        // Required columns mapping (based on user image/request)
        const columnMap = {
          'start city': 'from_city',
          'end city': 'to_city',
          'km count': 'distance',
          'sedan': 'sedan_price',
          'suv/ ertiga': 'suv_price',
          'crysta': 'crysta_price'
        };

        // Find indexes
        const indexes = {};
        const missingColumns = [];

        Object.keys(columnMap).forEach(key => {
          const index = headers.findIndex(h => h === key || h.includes(key));
          if (index !== -1) {
            indexes[columnMap[key]] = index;
          } else {
            // Flexible matching for 'suv' and 'crysta' if exact name doesn't match
            if (key === 'suv/ ertiga') {
               const suvIndex = headers.findIndex(h => h.includes('suv'));
               if (suvIndex !== -1) indexes['suv_price'] = suvIndex;
               else missingColumns.push(key);
            } else {
               missingColumns.push(key);
            }
          }
        });

        // Basic validation of columns (we need at least cities and one price)
        if (indexes.from_city === undefined || indexes.to_city === undefined) {
          throw new Error(`Missing required columns: Start City or End City. Found: ${headers.join(', ')}`);
        }

        const parsedRows = [];
        const errors = [];

        rows.forEach((row, rowIndex) => {
          // Skip empty rows
          if (!row || row.length === 0) return;
          
          const rowData = {};
          let isValid = true;
          let rowError = null;

          try {
            // Extract and clean data
            rowData.from_city = (row[indexes.from_city] || '').toString().trim();
            rowData.to_city = (row[indexes.to_city] || '').toString().trim();
            
            // Skip rows without cities
            if (!rowData.from_city || !rowData.to_city) {
                return; // Just skip empty/invalid rows quietly or track them? Let's skip empty ones.
            }

            // Prices
            rowData.sedan_price = parsePrice(row[indexes.sedan_price]);
            rowData.suv_price = parsePrice(row[indexes.suv_price]);
            rowData.crysta_price = parsePrice(row[indexes.crysta_price]);
            
            // Distance
            rowData.distance = (row[indexes.distance] || '').toString().trim();
            if (rowData.distance && !rowData.distance.toLowerCase().includes('km')) {
                rowData.distance += ' km';
            }

            // Generate Slug
            rowData.slug = generateSlug(rowData.from_city, rowData.to_city);

            // Validation: Need at least one price
            if (!rowData.sedan_price && !rowData.suv_price && !rowData.crysta_price) {
               isValid = false;
               rowError = "No valid prices found";
            }

          } catch (err) {
            isValid = false;
            rowError = err.message;
          }

          if (isValid) {
            parsedRows.push(rowData);
          } else {
            errors.push({ row: rowIndex + 2, error: rowError, data: row });
          }
        });

        resolve({ data: parsedRows, errors });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const parsePrice = (val) => {
  if (!val) return null;
  const num = parseInt(val.toString().replace(/[^0-9]/g, ''));
  return isNaN(num) ? null : num;
};

const generateSlug = (from, to) => {
  const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${sanitize(from)}-to-${sanitize(to)}-one-way-taxi`;
};