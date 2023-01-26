import { Box, Button, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { Card, CardProps } from "./Card"

const selectedColor = "rgba(87, 75, 68, 0.8)"

interface CardPickerProps {
  maxSelected?: number
  onSelected?: (selected: string[]) => any
  cards: Record<string, CardProps>
}

const CardPicker: React.FC<CardPickerProps> = ({ maxSelected = 4, onSelected, cards }) => {
  const [selected, setSelected] = useState<string[]>([])
  const [highlighted, setHighlighted] = useState<string[]>([])

  useEffect(() => {
    if (selected.length >= 1 && maxSelected === 1) {
      onContinue()
    }
  }, [selected])

  const isHighlighted = (identifier:string) => highlighted.includes(identifier)
  const isSelected = (identifier:string) => selected.includes(identifier)

  const onContinue = (evt?:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt?.stopPropagation()
    console.log('cards picked: ', selected)
    if (onSelected) {
      onSelected(selected)
    }
    setSelected([])
    setHighlighted([])
  }

  const onSelectedClick = (identifier: string) => {
    setSelected((s) => {
      const newSelected = [...s, identifier]
      if (newSelected.length > maxSelected) {
        return newSelected.slice(1)
      }
      return newSelected
    })
    setHighlighted((s) => s.filter((id) => id !== identifier))
  }

  const onHighlightClick = (identifier: string) => {
    setHighlighted((s) => [...s, identifier])
  }

  const onCardAreaClick = (evt:React.MouseEvent<HTMLDivElement, MouseEvent>, identifier:string) => {
    evt.stopPropagation()
    
    if (isSelected(identifier)) {
      //TODO: remove the selected
      return
    }
    if (isHighlighted(identifier)) {
      onSelectedClick(identifier)
      return
    }
    onHighlightClick(identifier)
  }

  return (
    <Box>
      <VStack spacing={8}>
        <Wrap spacing="4" pt={"10px"}>
          {Object.values(cards).map((item) => {
            const isSelected = selected.includes(item.identifier)
            const padding = isHighlighted(item.identifier) || isSelected ? 4 : 8
            const bgColor = isSelected ? selectedColor : undefined

            return (
              <WrapItem key={`cardPicker-${item.identifier}`}>
                <VStack
                  onMouseDown={(evt) => onCardAreaClick(evt, item.identifier)}
                  spacing={2}
                  p="4"
                  pb={padding}
                  bgColor={bgColor}
                  borderRadius="12"
                >
                  <Card
                    card={item}
                    width={["150px", "150px", "200px"]}
                    showCost
                    showDescription={isHighlighted(item.identifier) && !isSelected}
                    cursor="pointer"
                  />
                  {isHighlighted(item.identifier) && !isSelected && (
                    <Button
                      variant="secondary"
                    >
                      Select
                    </Button>
                  )}
                  {isSelected && <Text>Selected</Text>}
                </VStack>
              </WrapItem>
            )
          })}
        </Wrap>
        {maxSelected > 1 && (
          <Button
            variant="primary"
            disabled={!(selected.length === maxSelected)}
            onMouseDown={onContinue}
          >
            Choose these {maxSelected} cards
          </Button>
        )}
      </VStack>
    </Box>
  )
}

export default CardPicker
