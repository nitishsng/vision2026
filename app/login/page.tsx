// app/login/page.tsx
import LoginForm from "@/src/components/LoginForm";

export const dynamic = 'force-dynamic'; 

export default function login() {
  return <LoginForm />;
}
