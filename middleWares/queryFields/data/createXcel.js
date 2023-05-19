
const exportUsersToExcel = require('./exportService');



const workSheetColumnName = [
    "აღების მისამართი",
    "ჩაბარების მისამართი",
    "სერვისი",
    "აღების თარიღი",
    "ჩაბარების თარიღი",
    "აღწერა",
    "გამგზავნის ტელეფონი",
    "მიმღების ტელეფონი",
    "რეგისტრაციის თარიღი",
    "id",
    "სტატუს",
    "ფასი",
    "კლიენტი",
    "კლიენტის სახელი",
    "ჩამბარებელი კურიერი",
    "გადახდილია",
    "ამღები კურიერი",
]

const loadFile  =async (items)=> {
    const workSheetName = 'items';
    const filePath = './middleWares/excel-data.xlsx';
    await exportUsersToExcel(items, workSheetColumnName, workSheetName, filePath);
}

// const workSheetName = 'items';
// const filePath = './middleWares/excel-data.xlsx';
//
// console.log(users, workSheetColumnName, workSheetName)
// exportUsersToExcel(users, workSheetColumnName, workSheetName, filePath);
module.exports = loadFile
