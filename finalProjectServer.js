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

app.use(express.static(__dirname + '/templates'));
app.use(bodyParser.urlencoded({extended:false}));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

const client = new MongoClient('mongodb+srv://jlianMG:lM9vqUUAvTux8H1V@cluster0.txnqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const portNumber = 5000;

async function getCoffee() {
    const coffeeResponse = await fetch('https://coffee.alexflipnote.dev/random.json')
    await coffeeResponse.json()
        .then(data => {

            return data;

            console.log('Random Coffee Picture URL:', data.file);
            // You can use the image URL to display the coffee picture on your website
            const img = document.createElement('img');
            img.src = data.file;
            document.body.appendChild(img);


        })
        .catch(error => console.error('Error fetching coffee picture:', error));
}



app.get("/", (request, response) => {
    //<img id = "coffee" src = "https://coffee.alexflipnote.dev/random">
    apiData = getCoffee();
    coffeePicture = `<img id = "coffee" src = ${apiData.file} alt = "Random Coffee Picture">`


    variables = {
        coffeePicture: coffeePicture
    }

    response.render("home", variables);
});

app.get("/placeOrder", (request, response) => {
    response.render("placeOrder");
});

app.post("/placeOrderConfirmation", async (request, response) => {
    let {drink, name, phone, message} = request.body;
    orderPlace(drink, name, phone, message);
    response.render("home");
});

app.get("/orderHistory", (request, response) => {
    response.render("orderHistory");
});

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