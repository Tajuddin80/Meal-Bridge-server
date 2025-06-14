require("dotenv").config();
const express = require("express");
const cors = require('cors')
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


    // add user to database
    app.post("/adduser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
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
