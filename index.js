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
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
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
    // await client.connect();
    const db = client.db("mealBridge");

    const usersCollection = db.collection("allUsers");
    const foodCollection = db.collection("foodCollection");
    const reviewCollection = db.collection("reviews");
    const requestedFoodCollection = db.collection("requestedFoods");

    // user related apis

    app.post("/adduser", verifyFirebaseToken, async (req, res) => {
      try {
        const userData = req.body;

        if (userData.email !== req.decoded.email) {
          return res.status(403).send({ message: "Forbidden: Email mismatch" });
        }

        const existingUser = await usersCollection.findOne({
          email: userData.email,
        });
        if (existingUser) {
          return res.status(200).send({ message: "User already exists" });
        }

        const result = await usersCollection.insertOne(userData);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error in /adduser:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/users", verifyFirebaseToken, async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });
    // --- Review related apis ---
    app.post("/addreviews", verifyFirebaseToken, async (req, res) => {
      try {
        const reviewData = req.body;

        reviewData.userEmail = req.decoded.email;

        const result = await reviewCollection.insertOne(reviewData);
        res.send(result);
      } catch (error) {
        console.error("Failed to add review:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.get("/allreviews", async (req, res) => {
      try {
        const result = await reviewCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // --- Food related routes ---
    app.post("/addfood", verifyFirebaseToken, async (req, res) => {
      const newFood = req.body;
      newFood.donor = {
        donorEmail: req.decoded.email,
        donorName: req.decoded.name || "Unknown",
        donorImage: req.decoded.picture || "",
      };
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

    app.put("/updateFood/:id", verifyFirebaseToken, async (req, res) => {
      const { id } = req.params;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      if (!food) return res.status(404).send({ message: "Food not found" });

      if (food.donor.donorEmail !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden: Not your food" });
      }

      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );
      res.send(result);
    });

    // update foods amount
    app.patch(
      "/updateFoodAmount/:id",
      verifyFirebaseToken,
      async (req, res) => {
        const { id } = req.params;
        const { foodQuantity } = req.body;

        if (foodQuantity === undefined) {
          return res.status(400).send({ error: "foodQuantity is required" });
        }

        const result = await foodCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { foodQuantity } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ error: "Food not found or no change" });
        }

        res.send({ success: true });
      }
    );

    // delete request by id
    app.delete("/allfoods/:id", verifyFirebaseToken, async (req, res) => {
      // Optionally, also check if the requester is the donor
      const { id } = req.params;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      if (!food) return res.status(404).send({ message: "Food not found" });

      if (food.donor.donorEmail !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden: Not your food" });
      }

      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //  requested food related apis

    app.post("/requestedFood", verifyFirebaseToken, async (req, res) => {
      // Ensure requestedUser email matches decoded token email
      const requestedFood = req.body;
      requestedFood.requestedUser = {
        email: req.decoded.email,
        name: req.decoded.name || "Unknown",
        image: req.decoded.picture || "",
      };
      const result = await requestedFoodCollection.insertOne(requestedFood);
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
        res
          .status(500)
          .send({ message: "Server error fetching requested food" });
      }
    });

    app.delete("/requestedFood/:id", verifyFirebaseToken, async (req, res) => {
      const { id } = req.params;
      const request = await requestedFoodCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!request)
        return res
          .status(404)
          .send({ success: false, message: "Request not found" });

      if (request.requestedUser.email !== req.decoded.email) {
        return res
          .status(403)
          .send({ success: false, message: "Forbidden: Not your request" });
      }

      const result = await requestedFoodCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({ success: true, message: "Deleted successfully", result });
    });

    // await client.db("admin").command({ ping: 1 });
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
