const hre = require("hardhat");

async function main() {
    // Explicitly check if ethers exists in the environment
    if (!hre.ethers) {
        throw new Error("Hardhat Ethers plugin not found. Please ensure @nomicfoundation/hardhat-ethers is installed.");
    }

    const [deployer] = await hre.ethers.getSigners();

    console.log("================================================");
    console.log("Deploying with account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("================================================\n");

    // YOUR GNOSIS SAFE ADDRESS (Replace with yours)
    const GNOSIS_SAFE_ADDRESS = "0x2781dc9A92659C64a392c989CFFda745d8B02f8E";

    console.log("Step 1: Deploying DonationReceipt (NFT)...");
    const DonationReceipt = await hre.ethers.getContractFactory("DonationReceipt");
    const nft = await DonationReceipt.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ NFT Address:", nftAddress);

    console.log("\nStep 2: Deploying DonationModuleV2...");
    const DonationModule = await hre.ethers.getContractFactory("DonationModuleV2");
    const module = await DonationModule.deploy(GNOSIS_SAFE_ADDRESS, nftAddress);
    await module.waitForDeployment();
    const moduleAddress = await module.getAddress();
    console.log("✅ Module Address:", moduleAddress);

    console.log("\nStep 3: Linking Module to NFT...");
    const tx = await nft.setModuleAddress(moduleAddress);
    await tx.wait();
    console.log("✅ Handshake Complete.");

    console.log("\nDeployment finished successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});