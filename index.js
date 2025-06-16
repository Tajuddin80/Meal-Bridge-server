require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const db = client.db("mealBridge");

    const usersCollection = db.collection("allUsers");
    const foodCollection = db.collection("foodCollection");
    const reviewCollection = db.collection("reviews");
    const requestedFoodCollection = db.collection("requestedFoods");

    // --- User routes ---
    app.post("/adduser", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // --- Food routes ---
    app.post("/addFood", async (req, res) => {
      const result = await foodCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/featuredfood", async (req, res) => {
      const result = await foodCollection
        .find({ foodStatus: "available" })
        .sort({ foodQuantity: -1 })
        .limit(6)
        .toArray();
      res.send(result);
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
      res.send(result);
    });

    app.get("/allFoods/:id", async (req, res) => {
      const { id } = req.params;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      if (!food) {
        return res.status(404).send({ message: "Food not found" });
      }
      res.send(food);
    });

    app.put("/updateFood/:id", async (req, res) => {
      const { id } = req.params;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.patch("/updateFoodAmount/:id", async (req, res) => {
      const { id } = req.params;
      const { foodQuantity } = req.body;

      if (foodQuantity === undefined) {
        return res.status(400).send({ error: "foodQuantity is required" });
      }

      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { foodQuantity } }
      );

      if (result.modifiedCount > 0) {
        res.send({ success: true, message: "Food quantity updated", result });
      } else {
        res.send({ success: false, message: "No document updated", result });
      }
    });

    app.delete("/allfoods/:id", async (req, res) => {
      const { id } = req.params;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // --- Reviews ---
    app.post("/addreviews", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/allreviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

   
    app.post("/requestedFood", async (req, res) => {
      const result = await requestedFoodCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/requestedFood", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { "requestedUser.email": email };
        const result = await requestedFoodCollection.find(query).toArray();
        res.send(result);
      } else {
        const result = await requestedFoodCollection.find().toArray();
        res.send(result);
      }
    });

  
    app.delete("/requestedFood/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await requestedFoodCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Deleted successfully" });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Request not found" });
        }
      } catch (error) {
        console.error("Error deleting request:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });

    
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
   
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
