import { network } from "hardhat";

async function main() {
    const connection = await network.connect({
        network: "sepolia",
        chainType: "l1",
    });

    const viem = (connection as unknown as { viem: any }).viem;
    const [deployer] = await viem.getWalletClients();

    console.log("Deploying BurnoutNFTFactory with account: ", deployer.account.address);
    
    const factory = await viem.deployContract("BurnoutNFTFactory", []);
    console.log("BurnoutNFTFactory deployed to: ", factory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });