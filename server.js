import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import multer from "multer";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
let db, mongoClient;

async function connectToMongoDB() {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    
    const username = "garnetgithinji_db_user";
    const password = "Password123@";
    const encodedPassword = encodeURIComponent(password);
    
    const uri = `mongodb+srv://${username}:${encodedPassword}@deccm.b2yblee.mongodb.net/DECCMSYSTEM?retryWrites=true&w=majority`;
    
    console.log("📡 Using URI:", `mongodb+srv://${username}:***@deccm.b2yblee.mongodb.net/...`);
    
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });
    
    await mongoClient.connect();
    db = mongoClient.db("DECCMSYSTEM");
    
    await db.command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");
    console.log("📊 Database:", db.databaseName);
    
    await initializeCollections();
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    return false;
  }
}

async function initializeCollections() {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  if (!collectionNames.includes("users")) {
    await db.createCollection("users");
    
    // Insert only admin user - others will be created by admin
    await db.collection("users").insertOne({
      username: "admin",
      password: "admin123",
      fullName: "System Administrator",
      userRole: "admin",
      email: "admin@deccmsystem.com",
      phoneNumber: "",
      station: "Headquarters",
      createdAt: new Date(),
      isActive: true,
      lastLogin: null
    });
    
    console.log("👤 Created default admin user");
    console.log("   • Admin: admin / admin123");
  }
  
  if (!collectionNames.includes("evidence")) {
    await db.createCollection("evidence");
    console.log("📁 Created 'evidence' collection");
  }
}

// File upload setup
const uploadsDir = path.join(__dirname, "uploads/evidence");
const signaturesDir = path.join(__dirname, "uploads/signatures");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(signaturesDir)) fs.mkdirSync(signaturesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(4).toString("hex");
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `EV-${Date.now()}-${id}-${safeFileName}`);
  }
});

const upload = multer({ storage });

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// ============ USER MANAGEMENT ENDPOINTS ============

// 1. CREATE USER
app.post("/api/users/create", async (req, res) => {
  try {
    console.log("Received user creation request:", req.body);
    
    const { username, password, fullName, userRole, email, phoneNumber, station } = req.body;
    
    // Validate required fields
    if (!username || !password || !fullName || !userRole) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "Username, password, full name, and role are required" 
      });
    }
    
    // Validate user role
    const validRoles = ["admin", "officer", "analyst", "court", "investigator", "legal"];
    if (!validRoles.includes(userRole)) {
      console.log("Invalid role:", userRole);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user role" 
      });
    }
    
    // Check if username already exists
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      console.log("Username already exists:", username);
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }
    
    // Create user document
    const user = {
      username,
      password, // In production, use bcrypt.hash(password, 10)
      fullName,
      userRole,
      email: email || "",
      phoneNumber: phoneNumber || "",
      station: station || "",
      createdAt: new Date(),
      isActive: true,
      lastLogin: null
    };
    
    console.log("Creating user:", user);
    
    // Insert into database
    const result = await db.collection("users").insertOne(user);
    
    console.log("User created successfully, ID:", result.insertedId);
    
    res.json({ 
      success: true, 
      message: "User created successfully",
      userId: result.insertedId,
      user: {
        id: result.insertedId,
        username: user.username,
        fullName: user.fullName,
        userRole: user.userRole,
        email: user.email,
        station: user.station
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error creating user",
      error: error.message 
    });
  }
});

// 2. GET ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    console.log("Fetching all users...");
    
    const users = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${users.length} users`);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        fullName: u.fullName,
        userRole: u.userRole,
        email: u.email || "",
        phoneNumber: u.phoneNumber || "",
        station: u.station || "",
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        isActive: u.isActive
      }))
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users",
      error: error.message 
    });
  }
});

// 3. GET USER BY ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        userRole: user.userRole,
        email: user.email,
        phoneNumber: user.phoneNumber,
        station: user.station,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 4. UPDATE USER
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.id;
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "User updated successfully" 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// 5. DELETE USER (soft delete)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "User deactivated successfully" 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ============ AUTHENTICATION ENDPOINTS ============

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({ 
        success: false, 
        message: "Username and password required" 
      });
    }
    
    const user = await db.collection("users").findOne({ 
      username,
      isActive: true 
    });
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }
    
    // Simple password check (use bcrypt.compare in production)
    if (password !== user.password) {
      return res.json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }
    
    // Update last login
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    res.json({ 
      success: true, 
      userRole: user.userRole, 
      userId: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      message: "Login successful"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
});

// CREATE USER ENDPOINT (Fixed and tested)
app.post("/api/users/create", async (req, res) => {
  try {
    console.log("📝 User creation request received:", req.body);
    
    const { username, password, fullName, userRole, email, phoneNumber, station } = req.body;
    
    // Validate required fields
    if (!username || !password || !fullName || !userRole) {
      return res.status(400).json({ 
        success: false, 
        message: "Username, password, full name, and role are required" 
      });
    }
    
    // Check if username already exists
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists. Please choose a different username." 
      });
    }
    
    // Create new user object
    const newUser = {
      username: username.trim(),
      password: password, // In production, use: await bcrypt.hash(password, 10)
      fullName: fullName.trim(),
      userRole: userRole,
      email: email ? email.trim() : "",
      phoneNumber: phoneNumber ? phoneNumber.trim() : "",
      station: station ? station.trim() : "",
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    };
    
    console.log("Creating user:", newUser);
    
    // Insert into database
    const result = await db.collection("users").insertOne(newUser);
    
    console.log("✅ User created successfully. ID:", result.insertedId);
    
    res.json({
      success: true,
      message: "User account created successfully!",
      userId: result.insertedId,
      user: {
        id: result.insertedId,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.userRole
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message
    });
  }
});

// ============ DASHBOARD STATS ============

app.get("/api/stats", async (req, res) => {
  try {
    const [totalUsers, totalEvidence] = await Promise.all([
      db.collection("users").countDocuments({ isActive: true }),
      db.collection("evidence").countDocuments()
    ]);
    
    const officers = await db.collection("users").countDocuments({ 
      userRole: "officer", 
      isActive: true 
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUploads = await db.collection("evidence").countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvidence,
        officers,
        todayUploads
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    await db.command({ ping: 1 });
    
    res.json({
      success: true,
      status: "healthy",
      mongo: "connected",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      success: false,
      status: "unhealthy",
      error: error.message
    });
  }
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "public", page);
  
  if (fs.existsSync(filePath) && page.endsWith(".html")) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

// Start server
async function startServer() {
  const connected = await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${connected ? "✅ Connected" : "❌ Disconnected"}`);
    console.log(`\n🔗 API Endpoints:`);
    console.log(`   • Create User: POST /api/users/create`);
    console.log(`   • Get Users: GET /api/users`);
    console.log(`   • Login: POST /api/auth/login`);
    console.log(`   • Stats: GET /api/stats`);
    console.log(`\n👤 Default Admin:`);
    console.log(`   • Username: admin`);
    console.log(`   • Password: admin123`);
  });
}

startServer();