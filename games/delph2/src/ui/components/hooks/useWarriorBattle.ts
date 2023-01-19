import { Battle, Warrior } from "../../../syncing/schema/DelphsTableState";
import { usePlayCanvasContext } from "../appProvider";
import useBattles from "./useBattles";

const useWarriorBattle = (w?:Warrior):Battle|undefined => {
  const battles = useBattles()
  if (!w || !battles) {
    return undefined
  }

  const playerBattle = Object.values(battles).find((b) => b.warriorIds.includes(w.id))

  return playerBattle
}

export default useWarriorBattle