import BackgroundMusic from "@/components/BackgroundMusic";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <>
      <BackgroundMusic src="/sounds/bgm-login.wav" />
      <main className="home-container">
        <LoginForm />
      </main>
    </>
  );
}
