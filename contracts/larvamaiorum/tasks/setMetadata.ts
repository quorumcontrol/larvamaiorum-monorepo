import { task } from 'hardhat/config'
import { BigNumber } from 'ethers'
import { getLarvaMaiorum } from './helpers'

task('set-metadata')
  .addParam('url', 'the url of the new metadata bundle')
  .setAction(async ({url}, hre) => {
      const larvaMaiorum = await getLarvaMaiorum(hre)

      const receipt = await (await larvaMaiorum.addMetadataUri(url)).wait()
      const metadataUriLog = receipt.logs?.find(
        (log) =>
          log.topics[0] === larvaMaiorum.interface.getEventTopic("MetadataUriAdded")
      );
      const idx = larvaMaiorum.interface.parseLog(metadataUriLog!).args?.index as BigNumber;
      
      const tx = await larvaMaiorum.setCurrentlyMinting(idx)
      console.log('tx: ', tx.hash)
      await tx.wait()
      console.log('done')
  })