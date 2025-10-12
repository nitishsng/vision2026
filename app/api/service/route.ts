import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Service } from "../../../src/contexts/type";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body: Service = await req.json();

    // ✅ Validate user input
    if (!body.name || !body.price || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: patient name or phone number" },
        { status: 400 }
      );
    }

    // ✅ Get collection
    const collection = await getCollection<Service>("services");


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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection<Service>("services");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in PUT /api/service:", error);
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
        { success: false, error: "Service ID is required" },
        { status: 400 }
      );
    }
    
    const collection = await getCollection<Service>("services");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/service:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    // Get collection reference and fetch all documents
    const collection = await getCollection<Service>("services");

    // Assuming getCollection returns an array of documents
    const services = await collection.find({}).toArray(); // MongoDB style
    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

