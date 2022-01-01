const express = require('express')
const cors = require("cors")
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config()
const fileUpload = require("express-fileupload")
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const port = process.env.PORT || 5000;
const app = express()

// middlewares 
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sg7vl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("heroRiderDB");
        const userCollection = database.collection("users");
        const learnerCollection = database.collection("learner");

        // save a rider
        app.post("/add-user", async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const address = req.body.address;
            const phone = req.body.phone;
            const area = req.body.area;
            const carInfo = req.body.carInfo;
            const carType = req.body.carType;
            const userType = req.body.userType;

            const nid = req.files.nid;
            const nidData = nid.data;
            const encodedNidPic = nidData.toString('base64');
            const nidBuffer = Buffer.from(encodedNidPic, 'base64');

            const license = req.files.license;
            const licenseData = license.data;
            const encodedLicensePic = licenseData.toString('base64');
            const licenseBuffer = Buffer.from(encodedLicensePic, 'base64');

            const profile = req.files.profile;
            const proData = profile.data;
            const encodedProfilePic = proData.toString('base64');
            const profileBuffer = Buffer.from(encodedProfilePic, 'base64');

            const user = {
                userType,
                name,
                email,
                address,
                phone,
                area,
                carInfo,
                carType,
                nidPic: nidBuffer,
                licensePic: licenseBuffer,
                profilePic: profileBuffer,
            }
            const result = await userCollection.insertOne(user);
            res.json(result);
        })



        // save a learner 

        app.post("/add-learner", async (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const address = req.body.address;
            const phone = req.body.phone;


            const carType = req.body.carType;
            const userType = req.body.userType;

            const nid = req.files.nid;
            const nidData = nid.data;
            const encodedNidPic = nidData.toString('base64');
            const nidBuffer = Buffer.from(encodedNidPic, 'base64');



            const profile = req.files.profile;
            const proData = profile.data;
            const encodedProfilePic = proData.toString('base64');
            const profileBuffer = Buffer.from(encodedProfilePic, 'base64');

            const user = {
                userType,
                name,
                email,
                address,
                phone,
                carType,
                nidPic: nidBuffer,
                profilePic: profileBuffer,
            }
            const result = await learnerCollection.insertOne(user);
            res.json(result);
        })


        // get all users 
        app.get("/all-users", async (req, res) => {
            const result = await userCollection.find({}).toArray()
            res.json(result)

        })


        // get a single user 
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email
            const result = await userCollection.findOne({ email })

            res.json(result)
        })


        // get a learner 
        app.get("/learner/:email", async (req, res) => {
            const email = req.params.email
            const result = await learnerCollection.findOne({ email })

            res.json(result)
        })



        // payment
        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        })



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.json('running the student database server')
})

app.listen(port, () => {
    console.log("listening to the port ", port);
})