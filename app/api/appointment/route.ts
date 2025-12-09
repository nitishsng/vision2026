import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";

// Update appointment status
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 }
      );
    if (!status)
      return NextResponse.json(
        { success: false, error: "Missing status" },
        { status: 400 }
      );
    const patientsColl = await getCollection<PatientFullTypeWithObjectId>(
      "patients"
    );

    const result = await patientsColl.updateOne(
      { id },
      { $set: { status, updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    const updatedAppointment = await patientsColl.findOne({ id });
    if (!updatedAppointment)
      return NextResponse.json(
        { success: false, error: "Failed to fetch updated details" },
        { status: 500 }
      );

    // Insert patient if status is confirmed or completed

    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error: unknown) {
    console.error("Error in PUT:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Create new appointment
export async function POST(req: Request) {
  try {
    const body: PatientFullTypeWithObjectId = await req.json();

    // Validate basic required fields
    if (!body.ptName || (!body.phoneNo && !body.email)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const patientsColl = await getCollection<PatientFullTypeWithObjectId>(
      "patients"
    );

    // Find existing patient by name + phone OR name + email
    const existingPatient = await patientsColl.findOne({
      $or: [
        { $and: [{ ptName: body.ptName }, { phoneNo: body.phoneNo }] },
        { $and: [{ ptName: body.ptName }, { email: body.email }] },
      ],
    });

    // Check if they have any financial activity (derived total > 0)
    const visitSum = existingPatient && Array.isArray(existingPatient.visitDetails)
      ? existingPatient.visitDetails.reduce((sum, v) => sum + (Number(v.visitPrice) || 0), 0)
      : 0;
    const computedTotalAmount = existingPatient
      ? visitSum +
        (Number(existingPatient.framePrice) || 0) +
        (Number(existingPatient.lensePrice) || 0) +
        (Array.isArray(existingPatient.medicines)
          ? existingPatient.medicines.reduce(
              (sum, m) => sum + (Number(m.price) || 0),
              0
            )
          : 0)
      : 0;
    const isExistingAndHasAmount = Boolean(existingPatient && computedTotalAmount > 0);

    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    const appointmentData: PatientFullTypeWithObjectId = {
      ...body,
      repeated: Boolean(isExistingAndHasAmount), // true if same patient with due > 0
      updatedAt: now,
    };

    const result = await patientsColl.insertOne(appointmentData);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      repeated: isExistingAndHasAmount,
    });

  } catch (error: unknown) {
    console.error("Error in POST:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
