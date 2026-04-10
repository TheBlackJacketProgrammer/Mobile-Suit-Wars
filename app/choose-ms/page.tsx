import { redirect } from "next/navigation";
import BackgroundMusic from "@/components/BackgroundMusic";
import ChooseMSContainer from "./ChooseMSContainer";
import { getChooseMSList } from "../actions/getChooseMSList";
import { checkIfNewPlayer } from "../actions/checkIfNewPlayer";

export default async function ChooseMS() {

  const msList = await getChooseMSList();

  const userStatus = await checkIfNewPlayer();
  

  if (userStatus === "Old") {
    redirect("/dashboard");
  }

  return (
    <>
      <BackgroundMusic src="/sounds/bgm-choose-ms.wav" />
      <main className="choose-ms-container">
        <ChooseMSContainer propsMSList={msList} />
      </main>
    </>
  );
}
