const hre = require("hardhat"); //hre (Hardhat Runtime Environment) gives us the network, the deployer signer, and the contract factory.
const { ethers } = require("hardhat"); // ethers lets us format Ether values and generate the contract factory.
const fs = requir("fs"); // fs is optional today but we add it now so future lessons can read JSON files without changing the header.

async function main() {
    
    // Signer details
    const[deployer] = await ethers.getSigner();
    console.log("Deploying with: ", deployer.address);

    // This part is locating the smart contract, deploying it, waiting for confirmation and logging out status.
    const Contract = await ethers.getContractFactory("createNFT"); //Contract name of your smart contract.
    const contract = await Contract.deploy();
    await contract.waitForDeployment(); //Waits until the contract has been deployed.
    const address = await contract.getAddress();
    console.log("Contract deployed to: ", address);

    // We are now sensing 0.01 seth to the SC, and we will receive an NFT
    const tx = await contract.mint({ value: ethers.parseEther("0.01") }); //ethers.parseEther("0.01") converts 0.01 ETH to wei for us.
    const receipt = await tx.wait(); //Waits for receipt.
    console.log("Mint tx hash: ", receipt.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });