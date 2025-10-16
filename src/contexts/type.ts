export type Staff = {
  id: string;
  name: string;
  email?: string; 
  phone?: string; 
  role?: "admin" | "operator"; 
  createdAt?: string;
  password: string;
  isActive: boolean;
  updatedAt: string; 
};

export const initialStaff: Staff = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "operator",
  createdAt: new Date().toISOString(),
  password: "password",
  updatedAt: "",
  isActive: false,
};

export type staffWithId = Staff & { _id?: string };
export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "operator";
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string; 
  password: string;
};

export type AuthContextType = {
  user: User | null;
  logout: () => void;
  isLoading: boolean;
};

export type Service = {
  name: string;
  description: string;
  price: number;
  duration: string;
  category: "examination" | "treatment" | "surgery" | "consultation" | "";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  maxDiscouunt: number;
};
export type serviceWithId = Service & { _id?: string };
export const initialService: Service = {
  name: "",
  description: "",
  price: 0,
  duration: "",
  category: "", 
  isActive: true, 
  maxDiscouunt: 0,
  createdAt: new Date().toISOString(),
  updatedAt: "",
};



export type EyeDetail = {
  right: string;
  left: string;
};

export type PatientFullType = {
    id: string;
  ptName: string;
  age: number; 
  phoneNo: string;
  email?: string;
  preferredDate: string; 
  preferredTime: string; 
  purpose: "eye-test" | "frame-selection" | "consultation" | "follow-up";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: string;
  repeated: boolean;
  gender?: "";

  // Billing / Order Info
  visitDate?: Date | null;
  billNo: string;

  // Visit
  visitPrice: number;
  visitAdvance:number;
  // Optical

  // Order
  opticalPayDetails: {date:string,amount:number,transectionId:string}[];
  opticalAdvance: number;
  opticalDue: number;
  opticalaPrice: number;

  orderDate: string;

  frameId: string;
  lenseType: string;
  lensePrice: number;
  framePrice: number;
  deliveryStatus:string;
  deliveryDate: string;

  // Medicine
  medicines: {medicinename:string,price:number}[];
  medicinePrice: number;


  // Totals
  totalAmount: number;
  totalAdvance: number;
  totalDue: number;
  // Medical Info
  primaryWorkupBy: string;
  presentComplaints: string[];
  iopPachyCCT: {
    rightEye: {
      methodTime: string;
      iop: number;
      correctedIop?: number;
      cct?: number;
    };
    leftEye: {
      methodTime: string;
      iop: number;
      correctedIop?: number;
      cct?: number;
    };
  };
  vision: {
    rightEye: {
      unaidedDistance: string;
      unaidedNear?: string;
      bestCorrectedDistance?: string;
      bestCorrectedNear?: string;
    };
    leftEye: {
      unaidedDistance: string;
      unaidedNear?: string;
      bestCorrectedDistance?: string;
      bestCorrectedNear?: string;
    };
  };
  examinedBy: string;
  examDetails: {
  adnexa: EyeDetail;
  conjunctiva: EyeDetail;
  cornea: EyeDetail;
  anteriorChamber: EyeDetail;
  iris: EyeDetail;
  lens: EyeDetail;
  fundus: EyeDetail;
  orbit: EyeDetail;
  syringing: EyeDetail;
  vitreous: EyeDetail;
};
  orderOnly:boolean;
  diagnosis: string[];
  prescription: string;
  nextReview: string;
  doctorRemarks: string;
  glassesPrescription: {
    rightEye: {
      sph: string;
      cyl?: string;
      axis?: number;
      prism?: string;
      V_A?: string;
      N_V?: string;
      add?: string;
    };
    leftEye: {
      sph: string;
      cyl?: string;
      axis?: number;
      prism?: string;
      V_A?: string;
      N_V?: string;
      add?: string;
    };
    use: string;
  };
};


export type PatientFullTypeWithObjectId = PatientFullType & { _id?: string };
const defaultEyeDetail: EyeDetail = { right: "Normal", left: "Normal" };
export const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export const initialPatient:PatientFullTypeWithObjectId={
  id: "",
  ptName: "",
  age: 0,
  email: "",
  phoneNo: "",
  preferredDate: "",
  preferredTime: "",
  purpose: "eye-test",
  status: "pending",
  notes: "",
  createdAt: new Date(),
  visitDate: new Date(),
  updatedAt: "",
  gender: "",
  repeated: false,
 // Billing Info
  billNo: "",
  visitPrice: 0,
  visitAdvance:0,
  //order

  // frame
  orderDate: "",
  deliveryStatus:"pending",
  frameId: "",
  framePrice: 0,
  // lance
  lenseType: "",
  lensePrice: 0,
  deliveryDate: "",
  opticalPayDetails: [],
  opticalAdvance: 0,
  opticalDue: 0,
  opticalaPrice:0,



  //madicine
  medicines: [],
  medicinePrice: 0,


  totalAmount: 0,
  totalAdvance: 0,
  totalDue: 0,

  // Medical Info (empty/default values)
  orderOnly:false,
  primaryWorkupBy: "",
  presentComplaints: [],
  iopPachyCCT: {
    rightEye: { methodTime: "", iop: 0 },
    leftEye: { methodTime: "", iop: 0 },
  },
  vision: {
    rightEye: { unaidedDistance: "" },
    leftEye: { unaidedDistance: "" },
  },
  examinedBy: "",
  examDetails: {
      adnexa: { ...defaultEyeDetail },
  conjunctiva: { ...defaultEyeDetail },
  cornea: { ...defaultEyeDetail },
  anteriorChamber: { ...defaultEyeDetail },
  iris: { ...defaultEyeDetail },
  lens: { ...defaultEyeDetail },
  fundus: { ...defaultEyeDetail },
  orbit: { ...defaultEyeDetail },
  syringing: { ...defaultEyeDetail },
  vitreous: { ...defaultEyeDetail },
  },
  diagnosis: [],
  prescription: "",
  nextReview: "",
  doctorRemarks: "",
  glassesPrescription: {
    rightEye: { sph: "", add: "" },
    leftEye: { sph: "", add: "" },
    use: "",
  },
}



// export type Vendor = {
//   id: string;
//   name: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   address: string;
//   isActive: boolean;
//   createdAt: string; // ISO date string
//   updatedAt: string; // ISO date string
// };

// export type Order = {
//   id: string;
//   orderDate: string; // e.g., "2024-12-17"
//   ptName: string; // patient name
//   age: number;
//   gender: "male" | "female" | "other";
//   phone: string;
//   billNo: string;
//   rPower: string; // right eye power
//   lPower: string; // left eye power
//   advance: number;
//   due: number;
//   vendor: string; // linked to Company.name
//   rate: number;
//   frame: string;
//   lens: string;
//   total: number;
//   less: number;
//   adv: number;
//   dueAmount: number;
//   rcv: number;
//   deliveryDate: string; // ISO date string or empty if not set
//   opticalTotal: number;
//   status: "processing" | "completed" | "cancelled"; // restrict to valid states
//   createdAt: string; // ISO string
//   updatedAt: string; // ISO string
// };
