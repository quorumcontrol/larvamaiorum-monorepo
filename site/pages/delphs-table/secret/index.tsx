import { Box } from "@chakra-ui/react"
import { NextPage } from "next"
import { useEffect, useRef, useState } from "react"
import LoggedInLayout from "../../../src/components/LoggedInLayout"
import ReadyPlayerMeCreator from "../../../src/components/ReadyPlayerMeCreator"

const SecretIndex: NextPage = () => {
 
  return (
    <LoggedInLayout>
      <ReadyPlayerMeCreator
        w="100%"
        minH={800}
        onPicked={(url) => console.log("picked: ", url)}
      />
    </LoggedInLayout>
  )
}

export default SecretIndex
