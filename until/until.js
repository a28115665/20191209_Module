const fs = require("fs");

/**
 * [FindID description] 尋找Session的ID
 * @param {[type]} pSession [description]
 */
exports.FindID = function(pSession){
    let _id = null;

    if(pSession['key'] != undefined){
        _id = pSession['key'].U_ID
    }

    return _id;
}

/**
 * [isJson 檢查string是否為Json] 
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
exports.isJson = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * [getConfig 立馬取得Config當下的值]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
exports.getConfig = function(file){

    try {
        var filepath = __dirname + '/' + file;
        return readJsonFileSync(filepath);
    } catch (e) {
        throw e;
    }
}

function readJsonFileSync(filepath, encoding){

    try {
        if (typeof (encoding) == 'undefined'){
            encoding = 'utf8';
        }
        var file = fs.readFileSync(filepath, encoding);
        return JSON.parse(file);
    } catch (e) {
        throw e;
    }
}

/**
 * [extend 合併Object]
 * @param  {[type]} target [需要被合併的Objects]
 * @return {[type]}        [回傳合併後的Object]
 */
exports.extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
