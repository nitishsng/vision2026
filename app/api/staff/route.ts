import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Staff } from "../../../src/contexts/type";
import { ObjectId } from "mongodb";
export async function POST(req: Request) {
  try {
    const body: Staff = await req.json();

    // ✅ Validate user input
    if (!body.name || !body.phone || !body.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: patient name or phone number" },
        { status: 400 }
      );
    }
    
    // ✅ Get collection
    const collection = await getCollection<Staff>("staff");


    const result = await collection.insertOne({
      ...body,
      createdAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: unknown) {
    console.error("Error in api:", error);

    const message = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection<Staff>("staff");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/staff:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

