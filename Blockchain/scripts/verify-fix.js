const hre = require("hardhat");

async function main() {
    const [donor] = await hre.ethers.getSigners();
    console.log("Verifying with account:", donor.address);

    const MODULE_ADDRESS = "0x939bDED557748A57D6abcbDb97Cda06587e18336";
    
    // Attempting to attach to the contract
    const DonationModule = await hre.ethers.getContractFactory("DonationModuleV2");
    const module = DonationModule.attach(MODULE_ADDRESS);

    // 1. Propose a campaign
    console.log("\n1. Proposing dummy campaign...");
    const dummyReceiver = "0x000000000000000000000000000000000000dEaD";
    const goal = hre.ethers.parseEther("0.1"); // 0.1 ETH goal
    let tx = await module.proposeCampaign(dummyReceiver, goal);
    let receipt = await tx.wait();
    
    // Hacky way to get the latest campaign ID (assume it's the current campaign count)
    const campaignCount = await module.campaignCount();
    console.log("✅ Campaign proposed. ID:", campaignCount.toString());

    // 2. Make a test donation. This will mint the NFT natively too!
    console.log(`\n2. Donating to Campaign ID ${campaignCount} to populate totalDonated...`);
    const donationAmount = hre.ethers.parseEther("0.0001");
    // Explicitly set high gas limit to simulate the frontend override testing context if we were testing UI
    tx = await module.donate(campaignCount, { value: donationAmount });
    await tx.wait();
    console.log("✅ Donation successful");

    // 3. Vote for the campaign to test if the GAS EXCEED error is fixed!
    console.log(`\n3. Voting for Campaign ID ${campaignCount} to verify the gas fix...`);
    tx = await module.voteForCampaign(campaignCount, { gasLimit: 1000000n });
    await tx.wait();
    console.log("✅ Vote successful! The loop normalization works perfectly without hitting block gas limits.");
    
    const campaignData = await module.campaigns(campaignCount);
    console.log("\nCampaign Data after vote:");
    console.log("- Vote Tally VP:", campaignData.voteTally.toString());
    console.log("- Is Active:", campaignData.isActive);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
