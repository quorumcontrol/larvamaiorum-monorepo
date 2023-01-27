import { useMemo } from "react";
import { Warrior, Item } from "../../../syncing/schema/DelphsTableState";

export type InventoryKind = "battle" | "field"

const useInventory = (w?:Warrior):Item[] => {
  return useMemo(() => {
    if (!w) {
      return []
    }
    
    return w.inventory
  }, [w?.inventory]) 
}

export default useInventory
