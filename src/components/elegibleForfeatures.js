import { useAuth } from "../contexts/AuthContext";
export default function useEligibility() {
  const { user } = useAuth();

  return function isEligible(grade) {
    if (!user) return false; // or handle loading
    
    // Admins always have full access
    if (user.role === 'admin') return true;   
    return Number(user.staffGrade ?? 0) >= grade;
  };
}