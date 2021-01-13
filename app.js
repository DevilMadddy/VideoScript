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
    filedata = fs.writeFile(logFilepath, "Process started", function (err) {
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

function createVideoDirPath(teacherName, batch) {
    let currentDate = moment().format('MMM_D_YYYY');
    var dir = path(__dirname, config.videoDir, teacherName, moment().format('MMM_D_YYYY'), batch);
    return dir;
}

function createBatchDirectory(path) {

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
function copyDownloadedFiles(targetPath) {
    shell.mv(config.videoDownloadDirectory + "*.*", targetPath);
    // fs.copyFile(config.videoDownloadDirectory, targetPath, (err) => {
    //     if (err) throw err;
    //     console.log('source.txt was copied to destination.txt');
    // });
    // shell.cp('-R', config.videoDownloadDirectory, targetPath);
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
            .output(sourceFolderPath + '\\camcs' + '.mp4')
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
        var video =await splitvideo(splitVideoPath, compressedFilePath, index, startTime)
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
            // dirPath = __dirname + config.videoDirectory + config.teacher;
            // const writeFile = function () {
            //     fs.writeFile("/tmp/test", "Hey there!", function (err) {
            //         if (err) {
            //             return console.log(err);
            //         }
            //         console.log("The file was saved!");
            //     });
            // }
            // screeSize();
            // writeLogFile();

            let videodata = config.videoProcessingData[i];
            // //Open chrome with given url
            // await open(videodata.url, "chrome --kiosk");
            // await promSetTime(delayMaker, 5000);
            // // Type password to open the meeting
            // await promSetTime(typePwd, 4000, i);
            // // //Will press enter when the password is filled
            // await promSetTime(enter, 5000);
            // // //Will take cursor on download file
            // await promSetTime(downloadRecordings, 6000);
            var batchPath = path.join(__dirname, config.videoDir, videodata.teacher, currdate, videodata.batch);
            createBatchDirectory(batchPath);
            // // check file downloaded            
            await pSetInterval(1000);
            // // console.log("At 281");
            await promSetTime(copyDownloadedFiles, 1000, batchPath);
            // // // emptyDownloadedDir();//     var sourcePath = "./data/sushant/sushant.mp4"
            // console.log(__dirname)
            var fileName = findFileNameUsingExt(batchPath, 'mp4');
            console.log("fileName", fileName);
            var srcFilePath = batchPath + "\\" + fileName;
            var compressedFilePath = batchPath + '\\' + 'compressed.mp4';
            await compressVideo(srcFilePath, compressedFilePath);
            let fsizeInSec = await getVideoDurationInSeconds(compressedFilePath);
            let fsizeInMS = fsizeInSec * 1000;
            await splitProcedure(batchPath, compressedFilePath, fsizeInMS)
            emptyDownloadedDir();
        } catch (err) {
            console.log("catch 281", err.message);
            break;
        }
    }
})();

function promSetTime(cb, delay, val) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            cb(val);
            resolve();
        }, delay)
    })
}

function delayMaker() {
    console.log("Hello");
}