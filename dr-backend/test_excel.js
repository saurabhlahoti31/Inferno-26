
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const filePath = path.resolve('Inferno_Registrations_Final.xlsx');

async function testExcel() {
    console.log("Testing Excel Write to:", filePath);

    try {
        const workbook = new ExcelJS.Workbook();
        if (fs.existsSync(filePath)) {
            console.log("File exists, reading...");
            await workbook.xlsx.readFile(filePath);
        } else {
            console.log("File does not exist, creating new...");
            const sheet = workbook.addWorksheet('Registrations');
            sheet.columns = [{ header: 'Test', key: 'test' }];
        }

        const sheet = workbook.getWorksheet('Registrations');
        if (!sheet) {
            console.error("Sheet 'Registrations' not found!");
            return;
        }

        sheet.addRow({
            srNo: 999,
            name: "TEST ENTRY",
            regDate: new Date().toISOString()
        });

        console.log("Row added, writing file...");
        await workbook.xlsx.writeFile(filePath);
        console.log("SUCCESS: Written to file.");

    } catch (error) {
        console.error("ERROR:", error);
    }
}

testExcel();
