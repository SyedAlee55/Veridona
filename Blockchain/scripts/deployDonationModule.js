// To run the script and deploy the contract: npx hardhat run scripts / deployDonationModule.js--network sepolia

const hre = require("hardhat");

async function main() {
    // REPLACE THIS with your actual Gnosis Safe address on Sepolia
    const GNOSIS_SAFE_ADDRESS = process.env.GNOSIS_SAFE_ADDRESS;

    console.log("Deploying DonationModule...");

    // Get the contract factory
    const DonationModule = await hre.ethers.getContractFactory("DonationModule");

    // Deploy the contract with the Safe address as a constructor argument
    const donationModule = await DonationModule.deploy(GNOSIS_SAFE_ADDRESS);

    // Wait for the deployment to finish
    await donationModule.waitForDeployment();

    const address = await donationModule.getAddress();

    console.log("-----------------------------------------");
    console.log(`DonationModule deployed to: ${address}`);
    console.log(`Gnosis Safe linked: ${GNOSIS_SAFE_ADDRESS}`);
    console.log("-----------------------------------------");

    console.log("Next Step: Copy the 'DonationModule' address and add it as a Module in your Gnosis Safe UI.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});