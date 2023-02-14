import dotenv from 'dotenv'
import { createNewAiBoard } from "../src/game/boardFetching";

dotenv.config({
  path: "development.env"
})

async function main() {
  return createNewAiBoard()
}

// run main, wait for the result, catch the errors and exit
main().catch((err) => {
  console.error(err);
  process.exit(1);
}).then((res) => {
  console.log("result")
  console.log(JSON.stringify(res))
  process.exit(0)
});