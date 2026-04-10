import BackgroundMusic from "@/components/BackgroundMusic";
import RegisterForm from "@/components/RegisterForm";

export default function Register() {
  return (
    <>
      <BackgroundMusic src="/sounds/bgm-login.wav" />
      <main className="home-container">
        <RegisterForm />
      </main>
    </>
  );
}
