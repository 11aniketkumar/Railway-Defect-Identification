import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";

const dataFolderPath = path.join(path.resolve(), "data");
if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dataFolderPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public")));

app.listen(5000, () => {
    console.log("server is running on port 5000!");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/save_doc", upload.array("images"), (req, res) => {
    const pythonScriptPath = path.join(path.resolve(), "mainScript.py");

    const pythonProcess = exec(
        `python ${pythonScriptPath}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                res.status(500).send("Error executing Python script");
                return;
            }

            const exitCode = pythonProcess.exitCode;
            if (exitCode === 0) {
                res.redirect("/output");
            } else {
                console.error(`Python script exited with code ${exitCode}`);
                res.status(500).send("Python script exited with an error");
            }
        }
    );
});

app.get("/output", (req, res) => {
    const dataFolderPath = path.join(
        path.resolve(),
        "public",
        "spring_assembly",
        "crops",
        "missing"
    );

    fs.readdir(dataFolderPath, (err, items) => {
        if (err) {
            console.error("Error reading data folder:", err);
            return res.status(500).send("Internal Server Error");
        }

        res.render("output", { items });
    });
});
