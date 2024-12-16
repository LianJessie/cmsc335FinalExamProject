/*
    CMSC335: Final Exam Project
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
const databaseAndCollection = {db: "CMSC335DB", collection: "cafeOrders"};
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(bodyParser.urlencoded({extended:false}));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/templates'));

const client = new MongoClient('mongodb+srv://jlianMG:lM9vqUUAvTux8H1V@cluster0.txnqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const portNumber = 5000;

/* Retrieves random pictures of coffee from API. */
async function nextImage() {
    const response = await fetch('https://coffee.alexflipnote.dev/random.json').catch(error => console.error('Error fetching coffee picture:', error));
    return await response.json()
        .then(data => {
            console.log('Random Coffee Picture URL:', data.file);
            return data.file;
        });
}

/* Home Page */
app.get("/", async (request, response) => {

    coffeePic = "<img id = \"coffee\" src = \"";

    let imgSRC = nextImage();
    await imgSRC.then(function(result) {
        console.log(result);
        coffeePic += result + "\" alt = \"Random pictures of coffee.\">";
    });
    
    console.log(coffeePic);
    variables = {
        coffeePic: coffeePic
    }

    response.render("home", variables);
});

/* Place Order Page */
app.get("/placeOrder", (request, response) => {
    response.render("placeOrder");
});

/* Order Confirmed */
app.post("/placeOrderConfirmation", async (request, response) => {
    let {drink, name, phone, message} = request.body;

    // Data stored in Mongodb.
    orderPlace(drink, name, phone, message);

    coffeePic = "<img id = \"coffee\" src = \"";

    let imgSRC = nextImage();
    await imgSRC.then(function(result) {
        console.log(result);
        coffeePic += result + "\" alt = \"Random pictures of coffee.\">";
    });
    
    console.log(coffeePic);
    variables = {
        coffeePic: coffeePic
    }

    response.render("placeOrderConfirmation", variables);
});

/* Order History, Input Name */
app.get("/orderHistory", (request, response) => {
    response.render("orderHistory");
});

/* Order History List */
app.post("/orderHistoryList", async (request, response) => {

    let {orderName} = request.body;

    historyList = "";

    try {
        await client.connect();
        let filter = {name: orderName};
        const cursor = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .find(filter);
    
        const result = await cursor.toArray();

        if ((result) && (result.length > 0)) {
            result.forEach((element =>

                historyList += 
                `<div id = "entryList">
                    <div class = "orderEntry">
                        Drink: "${element.drink}"
                        <br>
                        Phone #: ${element.phone}
                        <br>
                        Date: ${element.date}
                        <br>
                        Message: "${element.message}"
                    </div>
                </div>`
            ));
        } else {
            historyList += `<div id = "entryList"><div class = "orderEntry">NONE</div></div>`
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    variables = {
        historyList: historyList
    }

    response.render("orderHistoryList", variables);
});

async function orderPlace(drink, name, phone, message) {
    try {
        await client.connect();
        
        let application = {
            drink: drink,
            name: name, 
            phone: phone, 
            date: new Date(), 
            message: message
        };

        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(application);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

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