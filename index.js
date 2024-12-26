require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//!! Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hl8mn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//$$ RUN Func
async function run() {
  try {
    //## Connect the client to the server	(optional starting in v4.7)
    // !! comment all before deployment

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment");

    // !! Work Starts from here

    const database = client.db("DineFlowDB");
    const allProducts = database.collection("AllFoods");
    const allOrders = database.collection("AllOrders");

    //@@ Getting All Products
    app.get("/all-foods", async (req, res) => {
      const cursor = allProducts.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //@@ Getting All Products IMAGE ONLY
    app.get("/gallery", async (req, res) => {
      const cursor = allProducts.find(
        {},
        {
          projection: {
            displayName: 1,
            description: 1,
            foodImage: 1,
            foodName: 1,
          },
        }
      );
      const result = await cursor.toArray();
      res.send(result);
    });

    //@@ Getting Single Product By ID
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const result = await allProducts.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //@@ Getting All Product By a User ID
    app.get("/foods/:uid", async (req, res) => {
      const id = req.params.uid;
      const cursor = allProducts.find({ uid: id });
      const result = await cursor.toArray();
      res.json(result);
    });

    //@@ Getting 6 Products
    app.get("/all-foods/:skip", async (req, res) => {
      const skip = parseInt(req.params.skip);
      const cursor = allProducts.find().skip(skip).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    //@@ Adding a new Product
    app.post("/all-foods", async (req, res) => {
      const product = req.body;
      const result = await allProducts.insertOne(product);
      res.send(result);
    });

    //!! DELETE Single Food
    app.delete("/all-foods/del/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.deleteOne(query);
      res.send(result);
    });

    //@@ Getting Order's By Seller ID
    app.get("/food/seller/:id", async (req, res) => {
      const id = req.params.id;
      const result = await allProducts.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //@@ Getting Order's By Buyer ID
    app.get("/food/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = allOrders.find({ buyerID: id });
      const result = await cursor.toArray();
      res.send(result);
    });

    //@@ Adding a new Order
    app.post("/orders", async (req, res) => {
      const purchase = req.body;
      const result = await allOrders.insertOne(purchase);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(port);
