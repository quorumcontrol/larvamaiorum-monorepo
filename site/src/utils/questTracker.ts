import { QuestTracker__factory } from '../../contracts/typechain/factories/QuestTracker__factory';
import { QuestTracker } from '../../contracts/typechain/QuestTracker';
import { memoize } from "../utils/memoize";
import multicallWrapper from "../utils/multicallWrapper";
import { addresses } from "../utils/networks";
import { skaleProvider } from "./skaleProvider";

export const questTrackerContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider);
  const unwrapped = QuestTracker__factory.connect(addresses().QuestTracker, skaleProvider);
  return multiCall.syncWrap<QuestTracker>(unwrapped);;
});
