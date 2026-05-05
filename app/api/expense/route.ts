import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Expense } from "../../../src/contexts/type";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body: Expense = await req.json();
    
    if (!body.amount || !body.text) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: amount or text" },
        { status: 400 }
      );
    }

    const collection = await getCollection<Expense>("expenses");

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

export async function GET() {
  try {
    const collection = await getCollection<Expense>("expenses");
    const expenses = await collection.find({}).sort({ date: -1 }).toArray();
    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error("Error in GET:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const reqBody = await req.json();
    const { id, amount, text, date } = reqBody;
    
    if (!id || !amount || !text) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const collection = await getCollection<Expense>("expenses");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          amount: Number(amount), 
          text, 
          date,
          updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          updatedBy: { name: reqBody.updatedBy.name, id: reqBody.updatedBy.id }
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
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

    const collection = await getCollection<Expense>("expenses");
    const objectId = new ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
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
