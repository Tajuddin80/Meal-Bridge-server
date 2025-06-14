require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  serverSelectionTimeoutMS: 3000,
  autoSelectFamily: false,
});

// const admin = require("firebase-admin");

// const serviceAccount = require("./meal-bridge-key.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

app.use(cors());
app.use(express.json());

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("mealBridge");

    const usersCollection = db.collection("allUsers");

    const foodCollection = db.collection("foodCollection");
 const reviewCollection = db.collection("reviews");

    // add user to database
    app.post("/adduser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // featured food by quantity
    app.get("/featuredfood", async (req, res) => {
      const result = await foodCollection
        .find()
        .sort({ foodQuantity: -1 })
        .limit(6)
        .toArray();
      res.status(200).send(result);
    });

    app.get("/allfoods", async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.status(200).send(result);
    });

    app.post('/addreviews', async(req, res)=>{
      const newReview = req.body
      const result = await reviewCollection.insertOne(newReview)
      res.send(result)
    })
       app.get("/allreviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.status(200).send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
