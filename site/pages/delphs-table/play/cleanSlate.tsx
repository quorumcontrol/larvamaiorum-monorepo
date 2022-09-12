import { Spinner } from "@chakra-ui/react"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Layout from "../../../src/components/Layout"

const CleanSlate: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.push("/delphs-table/play")
  })
  return (
    <Layout>
      <Spinner />
    </Layout>
  )
}

export default CleanSlate
