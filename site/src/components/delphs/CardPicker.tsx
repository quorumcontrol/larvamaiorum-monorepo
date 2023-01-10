import { Box, HStack } from "@chakra-ui/react"
import { itemsByIdentifier } from "../../delphs-table-logic/game/items"
import { Card } from "../../shared/Card"


const CardPicker:React.FC = () => {
  return (
    <Box>
      <HStack spacing="8">
        {Object.values(itemsByIdentifier).map((item) => {
          return <Card card={item} key={item.identifier} width={["90px", "90px", "90px", "200px"]} />
        })}
      </HStack>
    </Box>
  )
}

export default CardPicker