import { NextPage } from "next";
import CardPicker from "../../../src/components/delphs/CardPicker";
import Layout from "../../../src/components/Layout";

const CardPickerDemo:NextPage = () => {
  return (
    <Layout>
      <CardPicker />
    </Layout>
  )
}

export default CardPickerDemo