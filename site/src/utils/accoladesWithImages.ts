import gold from "../../assets/images/accolades/gold.png";
import silver from "../../assets/images/accolades/silver.png";
import bronze from "../../assets/images/accolades/bronze.png";
import firstgump from "../../assets/images/accolades/firstgump.png";
import firstblood from "../../assets/images/accolades/firstblood.png";
import battleWon from "../../assets/images/accolades/battlewon.png"
import { TOKENS as tokensWithoutImages } from './accolades'

const images = [
  gold,
  silver,
  bronze,
  firstgump,
  firstblood,
  battleWon,
]

export const ACCOLADES_WITH_IMAGES = tokensWithoutImages.map((t, i) => {
  return {
    ...t,
    image: images[i]
  }
})
