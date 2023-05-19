
const exportUsersToExcel = require('./exportLog');



const workSheetColumnName = [
    "Email",
    "თარიღი",
    "ძველი",
    "ცვლილება",
    "ახალი",
    "მიზეზი",
    "გადახდის თარიღი"
]

const loadFile  =async (items)=> {
    const workSheetName = 'items';
    const filePath = './middleWares/log-excel.xlsx';
    await exportUsersToExcel(items, workSheetColumnName, workSheetName, filePath);
}

// const workSheetName = 'items';
// const filePath = './middleWares/excel-data.xlsx';
//
// console.log(users, workSheetColumnName, workSheetName)
// exportUsersToExcel(users, workSheetColumnName, workSheetName, filePath);
module.exports = loadFile
