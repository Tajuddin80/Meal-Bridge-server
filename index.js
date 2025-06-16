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

// get from firebase project -> project overview wheel -> project settings -> service account
const admin = require("firebase-admin");
const serviceAccount = require("./meal-bridge-project-firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  // console.log(token);

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // console.log("Decoded data ", decoded);
    req.decoded = decoded;
    next();
  } catch (err) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

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

    // user related apis

    app.post("/adduser", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // --- Review related apis ---
    app.post("/addreviews", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/allreviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // --- Food related routes ---
    app.post("/addfood", async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    // featured food get request
    app.get("/featuredfood", async (req, res) => {
      const result = await foodCollection
        .find({ foodStatus: "available" })
        .sort({ foodQuantity: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/allfoods", async (req, res) => {
      const foods = await foodCollection
        .find({ foodStatus: "available" })
        .toArray();
      res.send(foods);
    });

    app.get("/myfoods", verifyFirebaseToken, async (req, res) => {
      const email = req.decoded.email;
      const result = await foodCollection
        .find({ "donor.donorEmail": email })
        .toArray();
      res.send(result);
    });

    app.get("/allFoods/:id", async (req, res) => {
      const food = await foodCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!food) return res.status(404).send({ message: "Food not found" });
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
    // update foods amount
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
    // delete request by id
    app.delete("/allfoods/:id", async (req, res) => {
      const { id } = req.params;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //  requested food related apis
    app.post("/requestedFood", async (req, res) => {
      const result = await requestedFoodCollection.insertOne(req.body);
      res.send(result);
    });


app.get("/requestedFood", verifyFirebaseToken, async (req, res) => {
  const email = req.decoded.email; // Always use decoded email

  try {
    const query = { "requestedUser.email": email };
    const result = await requestedFoodCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching requested food:", error);
    res.status(500).send({ message: "Server error fetching requested food" });
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
