const xlsx = require('xlsx');
const path = require('path');

const exportExcel = async (data, workSheetColumnNames, workSheetName, filePath) => {
    const workBook = await xlsx.utils.book_new();
    const workSheetData = [
        workSheetColumnNames,
        ... data
    ];
    const workSheet = await xlsx.utils.aoa_to_sheet(workSheetData);
    await xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    await xlsx.writeFile(workBook, path.resolve(filePath))
}

const exportUsersToExcel = async (users, workSheetColumnNames, workSheetName, filePath) => {
    const data = users.map(user => {
        return [
            user.courier,
            new Date(user.date).toLocaleString(),
            user.oldBudget,
            user.change,
            user.newBudget,
            user.changer,
            user.payDate,
        ];
    });
    await exportExcel(data, workSheetColumnNames, workSheetName, filePath);
}

module.exports = exportUsersToExcel;
