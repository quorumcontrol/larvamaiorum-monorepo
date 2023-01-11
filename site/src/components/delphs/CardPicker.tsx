import { Box, HStack, Wrap, WrapItem } from "@chakra-ui/react"
import { itemsByIdentifier } from "../../delphs-table-logic/game/items"
import { Card } from "../../shared/Card"

const CardPicker: React.FC = () => {
  return (
    <Box>
      <Wrap spacing="8">
        {Object.values(itemsByIdentifier).map((item) => {
          return (
            <WrapItem key={`cardPicker-${item.identifier}`}>
              <Card card={item} width={["90px", "90px", "90px", "200px"]} />
            </WrapItem>
          )
        })}
      </Wrap>
    </Box>
  )
}

export default CardPicker
