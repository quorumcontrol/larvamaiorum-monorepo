import { NextPage } from "next";
import CardPicker from "../../../src/shared/CardPicker";
import Layout from "../../../src/components/Layout";
import { itemsByIdentifier } from "../../../src/delphs-table-logic/game/items";

const CardPickerDemo:NextPage = () => {
  return (
    <Layout>
      <CardPicker cards={itemsByIdentifier} />
    </Layout>
  )
}

export default CardPickerDemo