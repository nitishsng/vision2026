import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
const DB_Name = process.env.DB_Name!;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1️⃣ Get user info from request header
    const authHeader = req.headers.get("x-user");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(authHeader);

    // 2️⃣ Check user role
    if (user.role !== "admin" && user.role !== "operator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Fetch data only if authorized
    const client = await clientPromise;
    const db = client.db(DB_Name);

    const [services, patients, staff] = await Promise.all([
      db.collection("services").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("patients").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("staff").find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    return NextResponse.json({ staff, services, patients });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
