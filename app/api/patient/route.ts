import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { PatientFullType } from "../../../src/contexts/type";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body: PatientFullType = await req.json();
    // ✅ Validate user input
    if (!body.ptName || !body.phoneNo) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: patient name or phone number" },
        { status: 400 }
      );
    }

    // ✅ Get collection
    const collection = await getCollection<PatientFullType>("patients");

    const result = await collection.insertOne({
      ...body,
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


// ✅ Update existing patient
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Missing document ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection<PatientFullType>("patients");

    // Ensure valid MongoDB ObjectId
    const objectId = new ObjectId(_id);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { ...updateData, updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in PUT:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ✅ Delete existing patient
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing document ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection<PatientFullType>("patients");
    const objectId = new ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in DELETE:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
