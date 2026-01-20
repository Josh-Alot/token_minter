import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseUnits } from "viem";

import { network } from "hardhat";

describe("BurnoutERC20Standard", async function () {
  const TOKEN_NAME = "Burnout Standard";
  const TOKEN_SYMBOL = "BST";
  const TOKEN_DECIMALS = 6;
  const INITIAL_SUPPLY = parseUnits("1000", TOKEN_DECIMALS);

  describe("Deployment", async function () {
    it("Should deploy with correct name, symbol and initial supply", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();

      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      assert.equal(await token.read.name(), TOKEN_NAME);
      assert.equal(await token.read.symbol(), TOKEN_SYMBOL);
      assert.equal(await token.read.decimals(), TOKEN_DECIMALS);
      assert.equal(await token.read.totalSupply(), INITIAL_SUPPLY);
      assert.equal(
        await token.read.balanceOf([deployer.account.address]),
        INITIAL_SUPPLY
      );
    });

    it("Should allow only supported decimals in constructor", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;

      // Supported decimals should deploy successfully.
      for (const decimals of [2, 4, 6, 18]) {
        const supply = parseUnits("1", decimals);
        const token = await viem.deployContract("BurnoutERC20Standard", [
          TOKEN_NAME,
          TOKEN_SYMBOL,
          decimals,
          supply,
        ]);
        assert.equal(await token.read.decimals(), decimals);
        assert.equal(await token.read.totalSupply(), supply);
      }

      // Unsupported decimals should revert with the custom error.
      const invalidDecimals = 8;
      await assert.rejects(
        viem.deployContract("BurnoutERC20Standard", [
          TOKEN_NAME,
          TOKEN_SYMBOL,
          invalidDecimals,
          parseUnits("1", invalidDecimals),
        ]),
        /InvalidDecimals/
      );
    });

    it('Should emit ContractEvent with "TOKEN_DEPLOYED" on deployment', async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "ContractEvent",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const deployEvent = events.find(
        (e: any) => e.args.eventType === "TOKEN_DEPLOYED"
      );
      assert(deployEvent !== undefined, "TOKEN_DEPLOYED event not found");
      assert.equal(
        getAddress(deployEvent.args.actor as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(deployEvent.args.target as string),
        "0x0000000000000000000000000000000000000000"
      );
      assert.equal(deployEvent.args.value, INITIAL_SUPPLY);
    });
  });

  describe("Minting", async function () {
    it("Should mint tokens to specified address", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseUnits("100", TOKEN_DECIMALS);
      await token.write.mint([recipient.account.address, mintAmount]);

      assert.equal(
        await token.read.balanceOf([recipient.account.address]),
        mintAmount
      );
      assert.equal(
        await token.read.totalSupply(),
        INITIAL_SUPPLY + mintAmount
      );

      // Deployer's balance is unchanged by mint-to-recipient
      assert.equal(
        await token.read.balanceOf([deployer.account.address]),
        INITIAL_SUPPLY
      );
    });

    it("Should emit TokenMinted event when minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseUnits("100", TOKEN_DECIMALS);
      const expectedTotalSupply = INITIAL_SUPPLY + mintAmount;
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.mint([recipient.account.address, mintAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokenMinted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(
        getAddress(events[0].args.minter as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(events[0].args.to as string),
        getAddress(recipient.account.address)
      );
      assert.equal(events[0].args.amount, mintAmount);
      assert.equal(events[0].args.newTotalSupply, expectedTotalSupply);
    });

    it('Should emit ContractEvent with "TOKENS_MINTED" when minting', async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseUnits("100", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.mint([recipient.account.address, mintAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "ContractEvent",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const mintEvent = events.find(
        (e: any) => e.args.eventType === "TOKENS_MINTED"
      );
      assert(mintEvent !== undefined, "TOKENS_MINTED event not found");
      assert.equal(
        getAddress(mintEvent.args.actor as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(mintEvent.args.target as string),
        getAddress(recipient.account.address)
      );
      assert.equal(mintEvent.args.value, mintAmount);
    });
  });

  describe("Transfers", async function () {
    it("Should transfer tokens between addresses", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseUnits("100", TOKEN_DECIMALS);
      await token.write.transfer([recipient.account.address, transferAmount]);

      assert.equal(
        await token.read.balanceOf([deployer.account.address]),
        INITIAL_SUPPLY - transferAmount
      );
      assert.equal(
        await token.read.balanceOf([recipient.account.address]),
        transferAmount
      );
    });

    it("Should emit TokenTransfered event on transfer", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseUnits("100", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.transfer([recipient.account.address, transferAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokenTransfered",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(
        getAddress(events[0].args.from as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(events[0].args.to as string),
        getAddress(recipient.account.address)
      );
      assert.equal(events[0].args.amount, transferAmount);
    });

    it('Should emit ContractEvent with "TOKENS_TRANSFERED" on transfer', async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseUnits("100", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.transfer([recipient.account.address, transferAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "ContractEvent",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const transferEvent = events.find(
        (e: any) => e.args.eventType === "TOKENS_TRANSFERED"
      );
      assert(transferEvent !== undefined, "TOKENS_TRANSFERED event not found");
      assert.equal(
        getAddress(transferEvent.args.actor as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(transferEvent.args.target as string),
        getAddress(recipient.account.address)
      );
      assert.equal(transferEvent.args.value, transferAmount);
    });

    it("Should revert transfer if insufficient balance", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const excessiveAmount = INITIAL_SUPPLY + parseUnits("1", TOKEN_DECIMALS);

      await assert.rejects(
        token.write.transfer([recipient.account.address, excessiveAmount]),
        /ERC20InsufficientBalance/
      );
    });
  });

  describe("Approvals", async function () {
    it("Should approve tokens for spender", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [owner, spender] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseUnits("200", TOKEN_DECIMALS);
      await token.write.approve([spender.account.address, approveAmount]);

      assert.equal(
        await token.read.allowance([owner.account.address, spender.account.address]),
        approveAmount
      );
    });

    it("Should emit TokenApproved event on approval", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [owner, spender] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseUnits("200", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.approve([spender.account.address, approveAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokenApproved",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(
        getAddress(events[0].args.owner as string),
        getAddress(owner.account.address)
      );
      assert.equal(
        getAddress(events[0].args.spender as string),
        getAddress(spender.account.address)
      );
      assert.equal(events[0].args.amount, approveAmount);
    });

    it('Should emit ContractEvent with "TOKENS_APPROVED" on approval', async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [owner, spender] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseUnits("200", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.approve([spender.account.address, approveAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "ContractEvent",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const approveEvent = events.find(
        (e: any) => e.args.eventType === "TOKENS_APPROVED"
      );
      assert(approveEvent !== undefined, "TOKENS_APPROVED event not found");
      assert.equal(
        getAddress(approveEvent.args.actor as string),
        getAddress(owner.account.address)
      );
      assert.equal(
        getAddress(approveEvent.args.target as string),
        getAddress(spender.account.address)
      );
      assert.equal(approveEvent.args.value, approveAmount);
    });

    it("Should allow transferFrom after approval", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [owner, spender, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseUnits("200", TOKEN_DECIMALS);
      const transferAmount = parseUnits("150", TOKEN_DECIMALS);

      await token.write.approve([spender.account.address, approveAmount]);
      await token.write.transferFrom(
        [owner.account.address, recipient.account.address, transferAmount],
        { account: spender.account }
      );

      assert.equal(
        await token.read.balanceOf([recipient.account.address]),
        transferAmount
      );
      assert.equal(
        await token.read.allowance([owner.account.address, spender.account.address]),
        approveAmount - transferAmount
      );
    });
  });

  describe("Burning", async function () {
    it("Should burn tokens from sender's balance", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const burnAmount = parseUnits("100", TOKEN_DECIMALS);
      const initialBalance = await token.read.balanceOf([deployer.account.address]);

      await token.write.burn([burnAmount]);

      assert.equal(
        await token.read.balanceOf([deployer.account.address]),
        initialBalance - burnAmount
      );
      assert.equal(await token.read.totalSupply(), INITIAL_SUPPLY - burnAmount);
    });

    it("Should emit TokenBurned event when burning", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const burnAmount = parseUnits("100", TOKEN_DECIMALS);
      const expectedTotalSupply = INITIAL_SUPPLY - burnAmount;
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.burn([burnAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokenBurned",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(
        getAddress(events[0].args.burner as string),
        getAddress(deployer.account.address)
      );
      assert.equal(events[0].args.amount, burnAmount);
      assert.equal(events[0].args.newTotalSupply, expectedTotalSupply);
    });

    it('Should emit ContractEvent with "TOKENS_BURNED" when burning', async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const burnAmount = parseUnits("100", TOKEN_DECIMALS);
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.burn([burnAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "ContractEvent",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const burnEvent = events.find(
        (e: any) => e.args.eventType === "TOKENS_BURNED"
      );
      assert(burnEvent !== undefined, "TOKENS_BURNED event not found");
      assert.equal(
        getAddress(burnEvent.args.actor as string),
        getAddress(deployer.account.address)
      );
      assert.equal(
        getAddress(burnEvent.args.target as string),
        "0x0000000000000000000000000000000000000000"
      );
      assert.equal(burnEvent.args.value, burnAmount);
    });

    it("Should revert burn if insufficient balance", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const token = await viem.deployContract("BurnoutERC20Standard", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        TOKEN_DECIMALS,
        INITIAL_SUPPLY,
      ]);

      const excessiveAmount = INITIAL_SUPPLY + parseUnits("1", TOKEN_DECIMALS);

      await assert.rejects(
        token.write.burn([excessiveAmount]),
        /ERC20InsufficientBalance/
      );
    });
  });
});
