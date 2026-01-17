export type Staff = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: "admin" | "operator";
  createdAt?: string;
  password: string;
  isActive: boolean;
  staffGrade: number;
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
  staffGrade: 1,
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
  staffGrade: number;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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
  catagory: string;
  ptName: string;
  age?: number;
  phoneNo: string;
  email?: string;
  address: string;
  preferredDate?: string;
  preferredTime?: string;
  purpose: "eye-test" | "frame-selection" | "consultation" | "follow-up";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt?: string;
  repeated: boolean;
  gender?: "";
  // Billing / Order Info
  billNo: string;
  visitDate?: string;
  visitDetails?: { visitDate: string; visitPrice: number }[];
  // Optical

  // Order
  opticalPayDetails: { date: string; amount: number; transectionId: string }[];

  orderDate: string;

  frameId: string;
  lenseType?: string;
  lensePrice: number;
  framePrice: number;
  deliveryStatus?: string;
  deliveryDate?: string;
  discount?:number;
  // Medicine
  medicines: { date: string; medicinename: string; price: number }[];

  // Medical Info
  primaryWorkupBy?: string;
  presentComplaints?: string[];
  iopPachyCCT?: {
    updateDate: string;
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
  }[];
  vision: {
    updateDate: string;
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
  }[];
  examinedBy?: string;
  examDetails?: {
    updateDate: string;
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
  }[];
  diagnosis?: { date: string; value: string }[];
  prescription?: string;
  nextReview?: string;
  doctorRemarks?: string;
  glassesPrescription?: {
    updateDate: string;
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
  }[];
};

export type PatientFullTypeWithObjectId = PatientFullType & { _id?: string };
export const todayDate = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

export const initialPatient: PatientFullTypeWithObjectId = {
  id: "",
  address:"",
  billNo:"",
  catagory: "patient",
  ptName: "",
  age: 0,
  phoneNo: "",
  lensePrice:0,
  frameId: "",
  framePrice:0,
  discount:0,
  opticalPayDetails: [],
  medicines: [],
  purpose: "consultation",
  status: "confirmed",
  createdAt: new Date(),
  repeated: false,
  visitDate: todayDate,
  // frame
  orderDate: "",
  deliveryStatus: "pending",
  vision: [],
};
