import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const DB_Name = process.env.DB_Name!;
if (!uri) throw new Error("Please define MONGODB_URI in .env.local or environment variables");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// prevent multiple connections during hot reload
if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri);
  globalThis._mongoClientPromise = client.connect();
}
clientPromise = globalThis._mongoClientPromise;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_Name); // explicitly set your database name

    // list collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    return NextResponse.json({
      success: true,
      databaseName: db.databaseName,
      collections: collectionNames,
    });
  } catch (error: unknown) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
