import { network } from "hardhat";
import { formatEther } from "viem";

async function main() {
  const networkToUse = process.env.HARDHAT_NETWORK || "hardhatMainnet";

  const connection = await network.connect({
    network: networkToUse === "hardhat" ? "hardhatMainnet" : networkToUse,
    chainType: "l1",
  });

  const viem = (connection as unknown as { viem: any }).viem;
  const [wallet] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const address = wallet.account.address;
  const balance = await publicClient.getBalance({
    address: address,
  });

  const balanceInEther = formatEther(balance);

  console.log("\n💰 Your Account Balance:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Address:", address);
  console.log("Network:", networkToUse);
  console.log("Balance:", balanceInEther, "ETH");
  console.log("Balance (Wei):", balance.toString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });