
import { checkIfNewPlayer } from "../actions/checkIfNewPlayer";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const userStatus = await checkIfNewPlayer();
  

  if (userStatus === "New") {
    redirect("/choose-ms");
  }

  return (
    <>
        
    </>
  );
}
