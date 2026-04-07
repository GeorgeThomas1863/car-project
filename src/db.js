import { MongoClient } from "mongodb";

let client = null;
let db = null;

export async function connectDB() {
  if (client) return db;

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("car_search");

  // query_cache indexes
  await db.collection("query_cache").createIndex({ queryHash: 1 }, { unique: true });
  await db.collection("query_cache").createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

  // search_history indexes
  await db.collection("search_history").createIndex({ createdAt: -1 });
  await db.collection("search_history").createIndex({ queryHash: 1 });

  console.log("[db] MongoDB connected");
  return db;
}

export function getDB() {
  if (!db) throw new Error("[db] Not connected");
  return db;
}

export async function getCachedResult(queryHash) {
  try {
    const doc = await getDB().collection("query_cache").findOne({ queryHash });
    return doc ? doc.marketcheckResponse : null;
  } catch (err) {
    console.warn("[db] Cache read failed:", err.message);
    return null;
  }
}

export async function setCachedResult(queryHash, marketcheckResponse, queryParams) {
  try {
    await getDB().collection("query_cache").updateOne(
      { queryHash },
      { $set: { queryHash, marketcheckResponse, queryParams, createdAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.warn("[db] Cache write failed:", err.message);
  }
}

export async function saveSearchHistory(entry) {
  try {
    await getDB().collection("search_history").insertOne({ ...entry, createdAt: new Date() });
  } catch (err) {
    console.warn("[db] History save failed:", err.message);
  }
}
