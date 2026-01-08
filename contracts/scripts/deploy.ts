import { network } from "hardhat";
import { parseEther } from "viem";

async function main() {
    const connection = await network.connect({
        network: "sepolia",
        chainType: "l1",
    });

    const viem = (connection as unknown as { viem: any }).viem;
    const [deployer] = await viem.getWalletClients();

    console.log("Deploying BurnoutToken with the account: ", deployer.account.address);

    const token = await viem.deployContract("BurnoutToken", [
        "BurnoutToken",
        "BURN",
        parseEther("10000000"),
    ]);

    console.log("BurnoutToken deployed to the address:", token.address);
    console.log("Token name:", await token.read.name());
    console.log("Token symbol", await token.read.symbol());
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});