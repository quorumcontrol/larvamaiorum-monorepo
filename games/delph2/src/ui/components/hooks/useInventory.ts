import { useMemo } from "react";
import { Warrior, Item } from "../../../syncing/schema/DelphsTableState";

const useInventory = (w?:Warrior):Item[] => {
  return useMemo(() => {
    if (!w) {
      return []
    }
    const inv:Item[] = []
    w.inventory.forEach((i) => {
      if (i.item.field) {
        inv.push(i.item)
      }
      return
    })
    return inv
  }, [w]) 
}

export default useInventory
