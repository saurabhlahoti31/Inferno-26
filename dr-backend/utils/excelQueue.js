import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

class ExcelQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.filePath = path.resolve('Inferno_Registrations_Final.xlsx'); // Changed name to avoid conflict
        this.initExcelFile();
    }

    async initExcelFile() {
        if (!fs.existsSync(this.filePath)) {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Registrations');

            // Format: sr.no, receipt no, reg date, part name, contact, college, wing, competition, amount, payment method, trans id, no of part, event date, event time
            sheet.columns = [
                { header: 'Sr. No', key: 'srNo', width: 10 },
                { header: 'Receipt No', key: 'receiptNo', width: 30 },
                { header: 'Registration Date', key: 'regDate', width: 20 },
                { header: 'Participant Name', key: 'name', width: 25 },
                { header: 'Contact No', key: 'phone', width: 15 },
                { header: 'College/Institute Name', key: 'college', width: 30 },
                { header: 'Name of Wing', key: 'wing', width: 20 },
                { header: 'Name of Competition', key: 'competition', width: 30 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Payment Method', key: 'paymentMethod', width: 20 },
                { header: 'Transaction ID / Cheque No', key: 'transactionId', width: 25 },
                { header: 'No. of Participants', key: 'participantCount', width: 15 },
                { header: 'Event Date', key: 'eventDate', width: 20 },
                { header: 'Event Time', key: 'eventTime', width: 20 }
            ];

            // Style header
            sheet.getRow(1).font = { bold: true };

            await workbook.xlsx.writeFile(this.filePath);
            console.log('Excel file created at:', this.filePath);
        } else {
            console.log('Excel file found at:', this.filePath);
        }
    }

    addToQueue(data) {
        return new Promise((resolve, reject) => {
            console.log("Adding to Excel Queue:", data.name);
            this.queue.push({ data, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const { data, resolve, reject } = this.queue.shift();

        try {
            console.log("Processing queue item for:", data.name);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(this.filePath);
            const sheet = workbook.getWorksheet('Registrations');

            if (!sheet) {
                throw new Error("Worksheet 'Registrations' not found in Excel file.");
            }

            // Logic: Create one row per event? Or one row per registration with merged cells? 
            // For simplicity and filterability, standard practice usually is one row per registration, 
            // joining multiple values with comma. 
            // If the user wants granular "Event Date" and "Event Time", multiple events makes this tricky in one row.
            // DECISION: Join with newlines or commas. Using newlines/commas for now to keep 1 participant = 1 row.

            const rowCount = sheet.rowCount; // This includes header row

            const wings = [...new Set(data.events.map(e => e.category))].join(', ');
            const competitions = data.events.map(e => e.name).join(', ');
            const eventDates = [...new Set(data.events.map(e => e.date))].join(', ');
            const eventTimes = data.events.map(e => e.time).join(', ');

            sheet.addRow({
                srNo: rowCount, // rowCount is 1-based, header is 1, so first data row is 2. SrNo should probably be rowCount - 1? No, logic: if empty, rowCount=1. New row will be 2. SrNo 1.
                receiptNo: data._id.toString(),
                regDate: data.registrationDateFormatted || new Date(data.timestamp).toLocaleDateString(),
                name: data.name,
                phone: data.phone,
                college: data.college,
                wing: wings,
                competition: competitions,
                amount: data.payment.amount,
                paymentMethod: data.payment.method,
                transactionId: data.payment.transactionId || 'N/A',
                participantCount: data.participantCount,
                eventDate: eventDates,
                eventTime: eventTimes
            });

            await workbook.xlsx.writeFile(this.filePath);
            console.log("Successfully wrote to Excel file for:", data.name);
            resolve('Added to Excel');
        } catch (error) {
            console.error('Error writing to Excel:', error);
            if (error.code === 'EBUSY' || error.message.includes('EBUSY')) {
                console.error("CRITICAL ERROR: The Excel file is OPEN in another program. Please close 'Inferno_Registrations_Final.xlsx' so the server can write to it!");
            }
            reject(error);
        } finally {
            this.isProcessing = false;
            this.processQueue();
        }
    }
}

const excelQueue = new ExcelQueue();
export default excelQueue;
