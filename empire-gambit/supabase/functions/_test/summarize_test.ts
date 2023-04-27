import { assertEquals, assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import { splitTextIntoChunks } from "../_shared/gamebot/approximateEncoding.ts";
import { recursivelySummarize } from "../_shared/gamebot/summarize.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

const content = `
Close WANTED: SEASON ZERO by 0xBattleGround will be released as a BETA-TEST soon before its official release. Secure your SEASON ZERO access and get on the whitelist now. Watch the Game-Trailer Join Discord PLAY, EARN AND OWN PLAY A competitive game that is funto play – alone or with yourfriends or strangers EARN Earn rewards every timeyou win a match ordefeat an enemy OWN Own rare NFTs with real utility.All skins, guns, Ammo, skills are NFTs SELL Sell your NFTs andexchange your rewards forother crypto currencies Join Discord GALLERY ABOUT ox BattleGround A Battle Royal, PUBG and Call of Duty inspired game where players can fight on their own or form powerful teams and compete against others. The mission is to survive in different gameplay modes:• One Against All – Play on your own and kill as many opponents as possible to earn valuable Rewards and rare NFTs• Team Play – Form a team and fight against others in a time-based battle• Safe House– a member of your team is held captive, and your mission is to bring him to safety The game is free-to-play. However, surviving will be a challenge. You start with one of the few default characters, unarmed, without any ammo and without any special skills. Your mission is to find a Gun and ... survive! If you buy a special character (or acquire him during the game) you can upgrade his skills. Each NFT Character comes with a special skillset to handle specific (or multiple) weapons. Gain an advantage over your competition by being able to use a shotgun, rifle, machine gun or grenades.... and you better don’t run out of ammo! Join Discord NFT’s with in-game Utility • All NFT’s come with special utilities: Characters have special fighting skills i.e., some can use a rifle, others a shotgun.• You can acquire or upgrade special skills by mint-breed-burning your character• All guns which are NFTs have limited ammo and while in-game ammo can be collected, you might run out of it during the battle... Charakters/Skins HEALTH PACKS WEAPONS AMMO SKILLS AUTOSCALING GameLift’s autoscaling feature can start one, hundreds, or even thousands of instances simultaneously and stop unused instances in just minutes. DDOS PROTECTION GameLift is designed to safe-guard game servers from fre-quently occurring network and transport layer distributed denial of service (DDoS) attacks. MATCHMAKING Gamelift FlexMatch’s simple but powerful rules language makes it easy to quickly create robust player matchmaking for multi-player games LOW LATENCY Leveraging EC2 compute capacity, 22 regions, and 60 instance types, GameLift is capable to connect to 200 players in a session on the lowest latency instance available. Join Discord READ THE OX BATTLEGROUND WHITEPAPER- LEARN MORE ABOUT THE TOKENOMICS Join Discord - THE TEAM OF IBLOXX STUDIOS - Domenik Founder & CEO Jonathan Co-Founder & Advisor birgit Co-Founder & Advisor dennis Chief Marketing Officer marc Head of Business Development harly Chief Legal Officer ben Advisor maya Executive Assistant & HR jugal Blockchain Engineer kshitij Blockchain Engineer steffan Quant Engineer imaad Blockchain Engineer Fendi Game Developer arjun Data Scientist shahrukh Game Developer clarke 3D Artist linto 3D Artist Muhammed Community Manager Karim Game Developer Sunanth Multimedia Designer ali Game Developer Donald Fullstack Developer 0XBATTLEGROUND 2022developed by ibloxx studios dmcc 0xbattleground inc. Intershore C`.trim()

describe("Summarize", () => {
  it("should return a response", async () => {
    const chunks = splitTextIntoChunks(content)
    console.log("chunks: ", chunks)
    const summary = await recursivelySummarize("test-user", chunks)
    console.log("summary: ", summary)
    console.log("chunks: ", chunks)
  });
})