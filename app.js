const fs = require("fs");
const FileType = require('file-type');
const open = require('open');
var robot = require("robotjs");
var config = require('./config.json');
var childProcess = require('child_process');
const { exec } = require('child_process');
const { dir } = require("console");
const path = require("path");
var shell = require('shelljs');
var format = require('date-format');
var moment = require('moment');
var fsi = require('extfs');
var ffmpeg = require('fluent-ffmpeg');
var FfmpegCommand = require('fluent-ffmpeg');
var filesize = require("filesize");
const { getVideoDurationInSeconds } = require('get-video-duration');
const { duration, min, fn } = require("moment");
const fileSize = require("filesize");
var command = new FfmpegCommand();
const { width, height } = require("screenz");

let id;
const filedata = "";
const writeLogFile = function () {
    const currpath = path.join(__dirname, config.videoDirectory);
    const logFolderpath = path.join(currpath, log);
    const logFilepath = path.join(logFolderpath, "log.txt");
    filedata= fs.writeFile(logFilepath, "Process started", function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

const screeSize = function () {
    console.log(width);
    console.log(height);
}

function typePwd(i) {
    return new Promise(function (resolve, reject) {
        var password = config.videoProcessingData[i].password;
        robot.typeString(password);
    })
}

function enter() {
    robot.keyTap("enter");
}

function downloadRecordings() {
    robot.moveMouseSmooth(1448, 130);
    robot.mouseToggle("down", "left");
    robot.mouseClick("left");
}

function createVideoDirPath(folderName) {
    let currentDate = moment().format('MMM_D_YYYY');
    var dir = config.videoDirectory + folderName + "\\" + currentDate;
    return dir;
}

function createDirectoryUsingFolderName(folderName) {
    var path = __dirname + createVideoDirPath(folderName);
    shell.mkdir('-p', path);
}

function createdirectory(path) {
    fs.mkdir(path, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("New directory successfully created.")
        }
    });
}

function checkFileHasExtension(dirPath, extToFind) {
    // if 
    var files = fs.readdirSync(dirPath);
    console.log("64", files);
    for (var i = 0; i < files.length; i++) {
        let strArr = files[i].split(".");
        let ext = strArr.pop();
        console.log("68", ext, extToFind);
        if (ext == extToFind) {
            return true;
        }
    }
    return false;
}

// check file downloaded
// var id = setInterval(checkFileDownloaded, 1000);
function pSetInterval(interval) {
    return new Promise(function (resolve, reject) {
        id = setInterval(pCheckFileDownloaded, interval);
        function pCheckFileDownloaded() {
            console.log("82", config.videoDownloadDirectory)
            var isFileExtExistmp4 = checkFileHasExtension(config.videoDownloadDirectory, "mp4");
            if (isFileExtExistmp4) {
                console.log("86", isFileExtExistmp4);
                clearInterval(id);
                resolve();
                // return true;
                // continue;
            }
            // var isFileExtExist = checkFileHasExtension(config.videoDownloadDirectory, ".crdownload");
            // console.log(isFileExtExist);
            // if (!isFileExtExist) {
            //     return true;
            // }
        }
    })
}
function copyDownloadedFiles(targetfolderName) {
    var path = __dirname + createVideoDirPath(targetfolderName);
    console.log(path);
    shell.cp('-R', config.videoDownloadDirectory, path);
}

function emptyDownloadedDir() {
    const dirPath = config.videoDownloadDirectory;
    //  var files = fs.readdirSync(dirPath);

    let files = fs.readdirSync(dirPath);
    for (const file of files) {
        fs.unlinkSync(path.join(dirPath, file));
    }
}

function compressVideo(src, targetPath) {
    return new Promise(function (resolve, reject) {
        try {
            ffmpeg(src)
                .videoCodec('libx264')
                .on('progress', function (info) {
                    console.log('progress ' + info.timemark);
                })
                .on('end', function () {
                    // console.log('done processing input stream')
                    resolve();
                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                    reject(err.message);
                })
                // .save(__dirname + '/data/sushant/test.mp4');
                .save(targetPath);
        } catch (err) {
            reject(err);
        }
    })
}

function getCurrentDate() {
    return moment().format('MMM_D_YYYY');
}

function findFileNameUsingExt(dirPath, extToFind) {
    var files = fs.readdirSync(dirPath);
    console.log("64", files);
    for (var i = 0; i < files.length; i++) {
        let strArr = files[i].split(".");
        let ext = strArr.pop();
        console.log("68", ext, extToFind);
        if (ext == extToFind) {
            return files[i];
        }
    }
    return false;
};

function stringToTimeStamp(durationInMillis) {
    var date = new Date(Number(durationInMillis));
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var seconds = date.getUTCSeconds();
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
}

function splitvideo(sourceFolderPath, compressedSrc, pathIndex, start) {
    return new Promise(function (resolve, reject) {
        var startTime = stringToTimeStamp(start);
        var videoTime = stringToTimeStamp(config.videoMaxLength);
        console.log(videoTime);
        ffmpeg(compressedSrc)
            .setStartTime(startTime)
            .setDuration(videoTime)
            .noAudio()
            .output(sourceFolderPath + '\\Camcs' + '.mp4')
            .on('progress', function (info) {
                console.log('progress ', info);
            })
            .on('end', function (err) {
                if (!err) { console.log('conversion Done') }
                resolve();
            })
            .on('error', function (err) {
                console.log('error: ', err)
                reject(err.message);
            }).run()
    })
}

function noVideo(sourceFolderPath, compressedSrc, pathIndex, start) {
    return new Promise(function (resolve, reject) {
        var startTime = stringToTimeStamp(start);
        var videoTime = stringToTimeStamp(config.videoMaxLength);
        ffmpeg(compressedSrc)
            .setStartTime(startTime)
            .setDuration(videoTime)
            .noVideo()
            .output(sourceFolderPath + '\\audio' + '.m4a')
            .on('progress', function (info) {
                console.log('progress ', info);
            })
            .on('end', function (err) {
                if (!err) { console.log('conversion Done') }
                resolve();
            })
            .on('error', function (err) {
                console.log('error: ', err)
                reject(err.message);
            }).run()
    })
}

async function splitProcedure(sourceFolderPath, compressedFilePath, fsizeInMS) {

    var startTime = 0;
    var remain = fsizeInMS;
    var index = 1;
    var splitVideoPath = "";
    while (remain > config.videoMaxLength || (remain < config.videoMaxLength) && remain > 0) {
        console.log(splitVideoPath)
        splitVideoPath = sourceFolderPath + '\\split' + index;
        createdirectory(splitVideoPath);
        await splitvideo(splitVideoPath, compressedFilePath, index, startTime)
        await noVideo(splitVideoPath, compressedFilePath, index, startTime)
        var splitFileSize;  //split value ka size kitna hoga, ye define krna h abhi i.e., config.videoMaxLength
        writeJsonFile(splitVideoPath, splitFileSize);
        startTime = Number(startTime + Number(config.videoMaxLength));
        console.log(startTime);
        remain = Number(remain - Number(config.videoMaxLength));
        console.log(remain);
        index++;
        console.log(index);
    }
}

function writeJsonFile(path, startTime) {
    let videoInfo = {
        duration: "25000",
        audio_start: "0",
        mobile_start: "0",
        screen_start: "0"
    };
    videoInfo.duration = startTime;
    let data = JSON.stringify(videoInfo);
    fs.writeFileSync(path + "//" + "videoInfo.txt", data);
}

(async () => {
    let currdate = getCurrentDate();
    var index = 0;
    // console.log(config.length)
    for (let i = 0; i < config.videoProcessingData.length; i++) {
        try {
            // screeSize();
            writeLogFile();
            // let videodata = config.videoProcessingData[i];
            // //Open chrome with given url
            // await open(videodata.url, "chrome --kiosk");
            // await promSetTime(delayMaker, 5000);
            // // Type password to open the meeting
            // await promSetTime(typePwd, 4000, i);
            // //Will press enter when the password is filled
            // await promSetTime(enter, 5000);
            // //Will take cursor on download file
            // await promSetTime(downloadRecordings, 6000);
            createDirectoryUsingFolderName(videodata.teacher);
            // // // check file downloaded
            // await pSetInterval(1000);
            // // console.log("At 281");
            // await promSetTime(copyDownloadedFiles, 1000, videodata.teacher);
            // // emptyDownloadedDir();//     var sourcePath = "./data/sushant/sushant.mp4"
            // console.log(__dirname)
            // var fileName = findFileNameUsingExt(__dirname + config.videoDirectory + videodata.teacher + "\\" + currdate + "\\Downloads", 'mp4');
            // console.log("fileName", fileName);
            // var sourceFolderPath = path.join(__dirname + config.videoDirectory + videodata.teacher + '\\' + currdate + "\\Downloads", fileName);
            // var CopysourceFolderPath = path.join(__dirname + config.videoDirectory + videodata.teacher + '\\' + currdate + "\\Downloads");
            // var compressedFilePath = __dirname + config.videoDirectory + videodata.teacher + "\\" + currdate + "\\Downloads" + '\\' + 'compressed.mp4';
            // await compressVideo(sourceFolderPath, compressedFilePath);
            // let fsizeInSec = await getVideoDurationInSeconds(compressedFilePath);
            // let fsizeInMS = fsizeInSec * 1000;
            // await splitProcedure(CopysourceFolderPath, compressedFilePath, fsizeInMS)
            // emptyDownloadedDir();
        }
        catch (err) {
            console.log("catch 281", err.message);
            break;
        }
    }
})();


function promSetTime(cb, delay, i) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            cb(i);
            resolve();
        }, delay)
    })
}
function delayMaker() {
    console.log("Hello");
}
// (async () => {
//     var videoUrl = config.videoProcessingData[0].url;
//     // setTimeout(open(videoUrl, "chrome --kiosk"), 2000);
//     // setTimeout(typePwd, 3000);
//     // setTimeout(enter, 4000);
//     // setTimeout(downloadRecordings, 5000);
//     // createDirectory(config.videoProcessingData[0].teacher);
//     // setTimeout(copyDownloadedFiles("teacher"), 1000);
//     // createDirectory(config.videoProcessingData[0].teacher); 
//     // copyDownloadedFiles(config.videoProcessingData[0].teacher);
//     // emptyDownloadedDir();
// })();