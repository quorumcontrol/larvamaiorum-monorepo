import { Box, BoxProps, Icon, Text, VStack } from "@chakra-ui/react"
import { Vec2 } from "playcanvas"
import { useMemo, useRef, useState } from "react"
import { TbSwords } from "react-icons/tb"

const BattleRegionSelector: React.FC<
  BoxProps & {
    opponentPositon?: [number, number]
    onRegionSelect?: (normalizedClick: Vec2) => any
  }
> = (userProps) => {
  const [clickedOnce, setClickedOnce] = useState(false)
  const [lastClick, setLastClick] = useState<Vec2>(new Vec2(0, 0))

  const clickBox = useRef<HTMLDivElement>(null)
  const placementIcon = useRef<HTMLDivElement>(null)
  const { onRegionSelect, opponentPositon, ...props } = userProps

  const boundingRect = () => {
    if (!clickBox.current) {
      return undefined
    }
    return clickBox.current.getBoundingClientRect()
  }

  const topLeft = () => {
    const rect = boundingRect()
    if (!rect) {
      return undefined
    }
    return new Vec2(rect.left, rect.top)
  }

  const widthAndHeight = () => {
    const rect = boundingRect()
    if (!rect) {
      return undefined
    }
    return new Vec2(rect.width, rect.height).divScalar(2)
  }

  const centerPoint = () => {
    if (!topLeft() || !widthAndHeight()) {
      return undefined
    }
    return new Vec2().add2(topLeft()!, widthAndHeight()!)
  }

  const opponentPositonCoordinates = () => {
    if (!opponentPositon || !widthAndHeight() || !centerPoint()) {
      return undefined
    }
    return new Vec2(opponentPositon[0], opponentPositon[1])
      .mul(widthAndHeight()!)
      .add(widthAndHeight()!)
      .sub(new Vec2(32, 32))
  }

  const onClick: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    if (
      !topLeft() ||
      !placementIcon.current ||
      !centerPoint() ||
      !widthAndHeight()
    ) {
      console.error(
        topLeft(),
        placementIcon.current,
        centerPoint(),
        widthAndHeight()
      )
      throw new Error("no div")
    }
    console.log(evt)
    console.log(
      "box",
      boundingRect(),
      "screex, screeny",
      evt.clientX,
      evt.clientY,
      "center",
      centerPoint(),
    )

    const click = new Vec2(evt.clientX, evt.clientY)

    setClickedOnce(true)
    setLastClick(
      click
        .clone()
        .sub(topLeft()!)
        .sub(
          new Vec2(
            placementIcon.current.offsetWidth / 2,
            placementIcon.current.offsetHeight / 2
          )
        )
    )
    console.log("last click: ", click.clone().sub(topLeft()!))

    if (onRegionSelect) {
      onRegionSelect(click.clone().sub(centerPoint()!).div(widthAndHeight()!))
    }
  }

  return (
    <VStack spacing={0}>
      <Text>Top</Text>
      <Box
        bgColor={"rgba(0,0,0,0.6)"}
        w="200px"
        h="200px"
        ref={clickBox}
        onClick={onClick}
        borderRadius="xl"
        {...props}
        position="relative"
      >
        {opponentPositonCoordinates() && (
          <Box
            h="64px"
            w="64px"
            position="absolute"
            top={`${opponentPositonCoordinates()!.y}px`}
            left={`${opponentPositonCoordinates()!.x}px`}
            opacity={0.5}
          >
            <Icon as={TbSwords} w="100%" h="100%" color="brand.orange" />
          </Box>
        )}
        <Box
          ref={placementIcon}
          h="48px"
          w="48px"
          display={clickedOnce ? "box" : "none"}
          position="absolute"
          top={`${lastClick.y}px`}
          left={`${lastClick.x}px`}
        >
          <Icon as={TbSwords} color="white" w="100%" h="100%" />
        </Box>
      </Box>
      <Text>Bottom</Text>
    </VStack>
  )
}

export default BattleRegionSelector
