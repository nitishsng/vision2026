import { useAuth } from "../contexts/AuthContext";

export default function useEligibility() {
  const { user } = useAuth();

  return function (grade) {
    return (user?.staffGrade ?? 0) >= grade;
  };
}
