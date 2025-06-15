require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const requestedFoodCollection = db.collection("requestedFoods");

    // add user to database
    app.post("/adduser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // featured food by quantity
    app.get("/featuredfood", async (req, res) => {
      const result = await foodCollection
        .find({ foodStatus: "available" })
        .sort({ foodQuantity: -1 })
        .limit(6)
        .toArray();
      res.status(200).send(result);
    });

    app.get("/allfoods", async (req, res) => {
      const { email, id } = req.query;
      let query = {};

      if (id) {
        query = { _id: new ObjectId(id) };
      } else if (email) {
        query = { "donor.donorEmail": email };
      } else {
        query = { foodStatus: "available" };
      }
      const result = await foodCollection.find(query).toArray();
      res.status(200).send(result);
    });

    // Example Express route
    app.get("/allFoods/:id", async (req, res) => {
      const { id } = req.params;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      if (!food) {
        return res.status(404).send({ message: "Food not found" });
      }
      res.send(food);
    });

    app.put("/updateFood/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedFood,
      };
      const result = await foodCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/allfoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/addFood", async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    app.post("/addreviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });
    app.get("/allreviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.status(200).send(result);
    });




    app.post('/requestedFood', async(req, res)=>{
      const newRequest = req.body
      const result = await requestedFoodCollection.insertOne(newRequest)
      res.send(result)
    })

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
