import React from "react";
import { PatientFullTypeWithObjectId } from "@/src/contexts/type";

type Grand = {
  formData: PatientFullTypeWithObjectId;
};
const GrandAmount  : React.FC<Grand> = ({ formData}) => {
  return (
            <div className="bg-white shadow-md rounded-2xl  p-2 md:p-4 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-700 mb-1">
                Grand Totals
              </h3>
    
              <div className="grid grid-cols-3 gap-2 md:gap-6">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">T-Amount</label>
                  <input
                    type="number"
                    readOnly
                    value={
                      (formData.visitDetails || []).reduce(
                        (sum, v) => sum + (Number(v.visitPrice) || 0),
                        0
                      ) +
                      (formData.framePrice || 0) +
                      (formData.lensePrice || 0) - (formData.discount || 0) +
                      (formData.medicines || []).reduce(
                        (sum, m) => sum + (Number(m.price) || 0),
                        0
                      )
                    }
                    className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
    
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">
                    T-Advance
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={
                      (formData.opticalPayDetails || []).reduce(
                        (sum, d) => sum + (Number(d.amount) || 0),
                        0
                      ) +
                      (formData.visitDetails || []).reduce(
                        (sum, v) => sum + (Number(v.visitPrice) || 0),
                        0
                      ) +
                      (formData.medicines || []).reduce(
                        (sum, m) => sum + (Number(m.price) || 0),
                        0
                      )
                    }
                    className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
    
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">
                    Total Due
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={
                      (formData.framePrice || 0) +
                      (formData.lensePrice || 0) - (formData.discount || 0) -
                      (formData.opticalPayDetails || []).reduce(
                        (sum, d) => sum + (Number(d.amount) || 0),
                        0
                      )
                    }
                    className="border py-1 px-3 md:py-3 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
  )
}

export default GrandAmount