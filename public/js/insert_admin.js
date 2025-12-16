// insert_admin.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("DECCMSYSTEM");

    const result = await db.collection("users").insertOne({
        username: "admin",
        password: "pass", // plaintext for testing
        userRole: "admin",
        fullName: "Admin User"
    });

    console.log("✅ Test admin created:", result.insertedId);
    await client.close();
}

main().catch(console.error);
