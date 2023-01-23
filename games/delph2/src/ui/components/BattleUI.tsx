import { HStack, Spacer, VStack } from "@chakra-ui/react"
import { Battle } from "../../syncing/schema/DelphsTableState"
import BattleRegionSelector from "./BattleRegionSelector"
import PlayCard from "./PlayCard"
import BattleSlider from "./BattleSlider"

interface BattleUIProps {
  battle?: Battle
}

const BattleUI: React.FC<BattleUIProps> = ({}) => {
  return (
    <>
      <VStack w="100%" position="fixed" bottom="20px" left="0">
        <HStack p={4} spacing="12">
          <BattleRegionSelector />
          <Spacer />
          <PlayCard />
          <Spacer />
          <BattleSlider />
        </HStack>
      </VStack>
    </>
  )
}

export default BattleUI
