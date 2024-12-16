/*
    CMSC335: Project #5
    Jessie Lian (116970907)
*/

process.stdin.setEncoding("utf8");

const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })

const uri = process.env.MONGO_CONNECTION_STRING;

/* Database and collection: */
const databaseAndCollection = {db: "CMSC335DB", collection: "bobaOrders"};
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(bodyParser.urlencoded({extended:false}));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const portNumber = Number(process.argv[2]);

app.get("/", (request, response) => {
    response.render("home");
});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {

    const dataInput = process.stdin.read();

    if (dataInput !== null) {
        const command = dataInput.trim();

        if (command.toLowerCase() === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        }
        else {
            process.stdout.write(`Invalid command: ${command}\n`);
        }

        process.stdout.write(prompt);
        process.stdin.resume();
    }
});