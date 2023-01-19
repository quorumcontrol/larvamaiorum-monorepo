import { useMemo } from "react";
import { Warrior, Item } from "../../../syncing/schema/DelphsTableState";

export type InventoryKind = "battle" | "field"

const useInventory = (w?:Warrior, kind="field"):Item[] => {
  return useMemo(() => {
    if (!w) {
      return []
    }
    const inv:Item[] = []
    Object.values(w.inventory).forEach((i) => {
      if ((i.item as any)[kind]) {
        inv.push(i.item)
      }
      return
    })
    return inv
  }, [w, kind]) 
}

export default useInventory
