const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://davidjim0104:DavidJim0104@cluster0.4fvrocz.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB local conectado correctamente");

  } finally {
    await client.close();
  }
}

run().catch(console.error);

module.exports = conectarDB;