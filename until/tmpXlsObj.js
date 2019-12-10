var XlsxTemplate = require('xlsx-template');
const path = require('path');
const fs = require('fs');

// module.exports = {
//     GetXls : function(pXlsObj){
//         GetXls(pXlsObj);
//     }
// };

// //依據 excel template 取得 新匯出的excel檔案
// function GetXls(pXlsObj){

//     //1. Check xlsObj
//     var objErr = CheckXlsObj(pXlsObj);
//     if(objErr > ''){
//         return console.log(objErr);
//     }
//     else{
//         //2. Load an XLSX file into memory
//         fs.readFile(pXlsObj.TmpXlsFilePath, function(err, tmplData) {

//             if(err)
//                 return console.log(err)
     
//             //1. Create a template variable
//             var xlsTmpl = new XlsxTemplate(tmplData);
                    
//             //2. JsonStr convert to JsonObj
//             var setValues = JSON.parse(pXlsObj.JsonXls);
     
//             //3. Perform substitution
//             xlsTmpl.substitute(pXlsObj.SheetNumber, setValues);
     
//             //4. Get xls binary data
//             var binaryData = xlsTmpl.generate();
     
//             //5. output excel
//             fs.writeFile(pXlsObj.OutputXlsPath, binaryData, 'binary',function (err) {
//                 if (err) 
//                     return console.log(err);
//             });
     
//         });
//     }
    
// }

//依據 excel template 取得 新匯出的excel檔案
var GetXls = function (pXlsObj, callback){

    //1. Check xlsObj
    var objErr = CheckXlsObj(pXlsObj);
    if(objErr > ''){
        return callback(objErr, null);
    }
    else{
        //2. Load an XLSX file into memory
        fs.readFile(pXlsObj.TmpXlsFilePath, function(err, tmplData) {

            if(err) return callback(err, null);
     
            //1. Create a template variable
            var xlsTmpl = new XlsxTemplate(tmplData);
                    
            //2. JsonStr convert to JsonObj
            var setValues = pXlsObj.JsonXls;
            
            //3. Perform substitution
            xlsTmpl.substitute(pXlsObj.SheetNumber, setValues);
     
            //4. Get xls binary data
            var binaryData = xlsTmpl.generate();
            
            return callback(null, binaryData);

            //5. output excel
            // fs.writeFile(pXlsObj.OutputXlsPath, binaryData, 'binary', function (err) {
            //     if (err) return callback(err, null);

            // });
     
        });
    }
    
}

//Check xls object
function CheckXlsObj(pXlsObj){
    var rErr = '';
    if(pXlsObj != undefined){
        //檢核 JsonXls
        if(!HasValue(pXlsObj.JsonXls))
            rErr += '請傳入 JsonXls。\n'; //需匯入至excel的json格式字串
        if(!HasValue(pXlsObj.TmpXlsFilePath))
            rErr += '請傳入 TmpXlsFilePath。\n';//讀取template excel的路徑
        // if(!HasValue(pXlsObj.OutputXlsPath))
        //     rErr += '請傳入 OutputXlsPath。\n';//匯出之excel檔案路徑
        if(!HasValue(pXlsObj.SheetNumber))
            rErr += '請傳入 SheetNumber。';//指定excel的分頁
    }
    else{
        rErr = '請傳入匯出excel物件。';
    }
    return rErr;
}

//確認是否有值
function HasValue(pPara){
    if(pPara != undefined){
        if(pPara > ''){
            return true;
        }
    }
    return false;
}


//取得物件的key -- 目前沒有使用到
function GetObjKeys(pObj){

    if (pObj !== Object(pObj))
          throw new TypeError('Object.keys called on non-object');

    var rKeys=[],objKey;
    for(objKey in pObj) if(Object.prototype.hasOwnProperty.call(pObj,objKey)) rKeys.push(objKey);
    return rKeys;
    
}

module.exports.GetXls = GetXls;

