/*
* Project: Milestone 1
* File Name: main.js
* Description: Main file for Lab6
*
* Created Date: 16 February 2024
* Author: Charley Liao
*/

const path = require("path");
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "filteredimages");

async function main() {
    await IOhandler.unzip(zipFilePath,pathUnzipped)
    path_name = await IOhandler.readDir(pathUnzipped)
    IOhandler.choices(path_name,pathProcessed)
}

main();