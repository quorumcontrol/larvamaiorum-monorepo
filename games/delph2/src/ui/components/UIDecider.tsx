import BattleUI from "./BattleUI"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useWarriorBattle from "./hooks/useWarriorBattle"
import RightSideUI from "./RightSideUI"
import TopLeftUI from "./TopLeftUI"

const UIDecider: React.FC = () => {
  const player = useCurrentPlayer()
  const battle = useWarriorBattle(player)

  if (battle) {
    return (
      <BattleUI battle={battle} />
    )
  }

  return (
    <>
      <TopLeftUI />
      <RightSideUI />
    </>
  )
}

export default UIDecider
