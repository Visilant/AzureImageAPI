import xlsx from 'xlsx';
import fs from 'fs';

export const writeExcel = (data = [], name: string) => {
    return new Promise((resolve, reject) => {
        try {
            let ws = xlsx.utils.json_to_sheet(data);
            let wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, name);
            let folder = `public/excels/downloads`;
            let exists = fs.existsSync(folder);
            if (!exists) fs.mkdirSync(folder, { recursive: true });
            xlsx.writeFile(wb, `${folder}/${name}.xlsx`);
            resolve({ filepath: `excels/downloads/${name}.xlsx` });
        } catch (error) {
            reject(error)
        }
    });
}