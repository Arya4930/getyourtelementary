const fs = require('fs')
const xl = require('excel4node')

const getExcelSheet = (sheet) => {
    const jsonData = JSON.parse(fs.readFileSync(sheet, 'utf8'));

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Telemetry Data');
    const headerStyle = wb.createStyle({
        font: {
            bold: true,
            size: 12
        },
    });
    const headers = ['Time( T )', 'Speed ( KM/Hr )', 'Altitude ( KM )'];
    headers.forEach((header, index) => {
        ws.cell(1, index + 1).string(header).style(headerStyle);
    });
    jsonData.forEach((item, rowIndex) => {
        ws.cell(rowIndex + 2, 1).string(item.time || 'Not found'); // Time as string

        // Speed and Altitude should be numbers. Parse them safely.
        const speed = parseFloat(item.speed);
        const altitude = parseFloat(item.altitude);

        // Check if the parsed value is a valid number, otherwise use 0
        ws.cell(rowIndex + 2, 2).number(isNaN(speed) ? 0 : speed);
        ws.cell(rowIndex + 2, 3).number(isNaN(altitude) ? 0 : altitude);
    });

    wb.write('./results.xlsx', (err) => {
        if (err) {
            console.error('Error writing Excel file:', err);
        } else {
            console.log('Excel file created successfully!');
        }
    });
}

module.exports = getExcelSheet;