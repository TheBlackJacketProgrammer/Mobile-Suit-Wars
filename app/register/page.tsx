import BackgroundMusic from "@/components/BackgroundMusic";
import LoginForm from "@/components/LoginForm";

export default function Register() {
  return (
    <>
      <BackgroundMusic src="/sounds/bgm-login.wav" />
      <main className="home-container">
        <LoginForm />
      </main>
    </>
  );
}
