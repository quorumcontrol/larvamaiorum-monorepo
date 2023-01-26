import { HStack, Spacer, VStack } from "@chakra-ui/react"
import { Battle, BATTLE_CONTROL_MESSAGE, BattleControlMessage } from "../../syncing/schema/DelphsTableState"
import BattleRegionSelector from "./BattleRegionSelector"
import PlayCard from "./PlayCard"
import BattleSlider from "./BattleSlider"
import { usePlayCanvasContext } from "./appProvider"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import { Vec2 } from "playcanvas"
import { useEffect, useState } from "react"

interface BattleUIProps {
  battle?: Battle
}

const BattleUI: React.FC<BattleUIProps> = ({ battle }) => {
  const { app } = usePlayCanvasContext()
  const currentPlayer = useCurrentPlayer()
  const [regionSelect, setRegionSelect] = useState(new Vec2())
  const [sliderValue, setSliderValue] = useState(0)

  const opponentId = battle?.warriorIds.find((warriorId) => warriorId !== currentPlayer?.id)

  const opponentsControls = (battle?.approximateRegionControls as any)[opponentId || ""]

  useEffect(() => {
    app.fire(BATTLE_CONTROL_MESSAGE, {
      attackDefenseSlider: sliderValue,
      region: [regionSelect.x, regionSelect.y]
    } as BattleControlMessage)
  }, [sliderValue, regionSelect])

  const onSliderChange = (val:number) => {
    console.log("slider value change", val)
    setSliderValue(val)
  }

  const onRegionSelect = (normalizedClick: Vec2) => {
    console.log('new regional select', normalizedClick)
    setRegionSelect(normalizedClick)
  }

  return (
    <>
      <VStack w="100%" position="fixed" bottom="20px" left="0">
        <HStack p={4} spacing="12">
          <BattleRegionSelector opponentPositon={opponentsControls ? [opponentsControls.x, opponentsControls.z] : undefined} onRegionSelect={onRegionSelect} />
          <Spacer />
          <PlayCard />
          <Spacer />
          <BattleSlider value={sliderValue} onChange={onSliderChange}  />
        </HStack>
      </VStack>
    </>
  )
}

export default BattleUI
