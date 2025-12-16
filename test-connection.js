import { MongoClient } from 'mongodb';

async function testConnection() {
  console.log("🔍 Testing MongoDB Atlas Connection...");
  console.log("🔐 Using password: Password123@\n");
  
  // URL encode the @ symbol
  const password = "Password123%40";
  
  const uri = `mongodb+srv://garnetgithinji_db_user:${password}@deccm.b2yblee.mongodb.net/DECCMSYSTEM?retryWrites=true&w=majority`;
  
  console.log("📡 Connection string:", uri.replace(password, "***"));
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
  
  try {
    console.log("⏳ Connecting...");
    await client.connect();
    
    console.log("✅ SUCCESS! Connected to MongoDB Atlas!");
    
    // Test the database
    const db = client.db("DECCMSYSTEM");
    await db.command({ ping: 1 });
    console.log("🏓 Database ping successful!");
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log("\n📁 Collections in DECCMSYSTEM:");
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`   • ${collection.name}`);
      });
    } else {
      console.log("   (No collections yet - will be created on first run)");
    }
    
    await client.close();
    console.log("\n🎉 MongoDB connection test PASSED!");
    
  } catch (error) {
    console.error("\n❌ Connection FAILED:", error.message);
    console.log("\n🔧 Please verify:");
    console.log("1. Password is correct: Password123@");
    console.log("2. IP is whitelisted (0.0.0.0/0)");
    console.log("3. User 'garnetgithinji_db_user' exists in MongoDB Atlas");
    console.log("4. User has 'Read and write to any database' privileges");
  }
}

testConnection();