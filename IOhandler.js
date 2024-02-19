/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author: Charley Liao
 */

const yauzl = require("yauzl-promise"),
    fs = require("fs"),
    PNG = require("pngjs").PNG,
    path = require("path"),
    { pipeline } = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {
    const zip = await yauzl.open(pathIn);
    try {
        for await (const entry of zip) {
            if (entry.filename.endsWith("/")) {
                try {
                    await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
                } catch (err) {}
            } else {
                const readStream = await entry.openReadStream();
                const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
                await pipeline(readStream, writeStream);
            }
        }
        console.log("\nExtraction Completed");
    } finally {
        await zip.close();
    }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
    return new Promise((res, rej) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                rej(err);
            } else {
                let lst = [];
                files.forEach((file) => {
                    if (path.extname(file).includes("png")) {
                        lst.push(path.join(dir, file));
                    }
                });
                console.log("Directory Read\n");
                // console.log(lst)
                res(lst);
            }
        });
    });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
    const arrayLength = pathIn.length;
    for (let i = 0; i < arrayLength; i++) {
        fs.createReadStream(`${pathIn[i]}`)
            .pipe(
                new PNG({
                    filterType: 0,
                })
            )
            .on("parsed", function () {
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2;
                        const avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
                        // grey scale
                        this.data[idx] = avg;
                        this.data[idx + 1] = avg;
                        this.data[idx + 2] = avg;
                    }
                }
                this.pack().pipe(fs.createWriteStream(`${pathOut}/greyscale_${path.basename(pathIn[i])}`));
            });
    }
    console.log("Greyscale filtering completed.");
};

const sepia = (pathIn, pathOut) => {
    const arrayLength = pathIn.length;
    for (let i = 0; i < arrayLength; i++) {
        fs.createReadStream(`${pathIn[i]}`)
            .pipe(
                new PNG({
                    filterType: 0,
                })
            )
            .on("parsed", function () {
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2;
                        var r = this.data[idx];
                        var g = this.data[idx + 1];
                        var b = this.data[idx + 2];
                        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                        const tb = 0.272 * r + 0.534 * g + 0.131 * b;

                        // sepia scale
                        if (tr > 255) {
                            this.data[idx] = 255;
                        } else {
                            this.data[idx] = tr;
                        }
                        if (tg > 255) {
                            this.data[idx + 1] = 255;
                        } else {
                            this.data[idx + 1] = tg;
                        }
                        if (tb > 255) {
                            this.data[idx + 2] = 255;
                        } else {
                            this.data[idx + 2] = tb;
                        }
                    }
                }
                this.pack().pipe(fs.createWriteStream(`${pathOut}/sepia_${path.basename(pathIn[i])}`));
            });
    }
    console.log("Sepia filtering completed.");
};

// Filter Choice:
const choices = (pathIn, pathOut) => {
    list = ["Greyscale", "Sepia"];
    let i = 0;
    for (const item of list) {
        console.log(`${i + 1}. ${item}`);
        i++;
    }

    // Asks for user input to choose filter by using readline
    const choice = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    choice.question("Enter your choice: ", (answer) => {
        if (answer == 1) {
            grayScale(pathIn, pathOut);
        } else if (answer == 2) {
            sepia(pathIn, pathOut);
        } else {
            console.log("Invalid Choice, try again.");
        }
        choice.close();
    });
};

module.exports = {
    unzip,
    readDir,
    choices,
};
