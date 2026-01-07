import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseEther } from "viem";

import { network } from "hardhat";

describe("BurnoutToken", async function () {
  const TOKEN_NAME = "BurnoutToken";
  const TOKEN_SYMBOL = "BURN";
  const INITIAL_SUPPLY = parseEther("1000");

  describe("Deployment", async function () {
    it("Should deploy with correct name, symbol and initial supply", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      assert.equal(await token.read.name(), TOKEN_NAME);
      assert.equal(await token.read.symbol(), TOKEN_SYMBOL);
      assert.equal(await token.read.totalSupply(), INITIAL_SUPPLY);
      assert.equal(
        await token.read.balanceOf([deployer.account.address]),
        INITIAL_SUPPLY
      );
    });

    it("Should emit TokenDeployed event on deployment", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokenDeployed",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.deployer as string), getAddress(deployer.account.address));
      assert.equal(events[0].args.name, TOKEN_NAME);
      assert.equal(events[0].args.symbol, TOKEN_SYMBOL);
      assert.equal(events[0].args.initialSupply, INITIAL_SUPPLY);
    });

    it("Should emit ContractEvent with CONTRACT_DEPLOYED on deployment", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
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
        (e: any) => e.args.eventType === "CONTRACT_DEPLOYED"
      );
      assert(deployEvent !== undefined, "CONTRACT_DEPLOYED event not found");
      assert.equal(getAddress(deployEvent.args.actor as string), getAddress(deployer.account.address));
      assert.equal(getAddress(deployEvent.args.target as string), "0x0000000000000000000000000000000000000000");
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
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseEther("100");
      await token.write.mint([recipient.account.address, mintAmount]);

      assert.equal(
        await token.read.balanceOf([recipient.account.address]),
        mintAmount
      );
      assert.equal(
        await token.read.totalSupply(),
        INITIAL_SUPPLY + mintAmount
      );
    });

    it("Should emit TokensMinted event when minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseEther("100");
      const expectedTotalSupply = INITIAL_SUPPLY + mintAmount;
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.mint([recipient.account.address, mintAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokensMinted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.minter as string), getAddress(deployer.account.address));
      assert.equal(getAddress(events[0].args.to as string), getAddress(recipient.account.address));
      assert.equal(events[0].args.amount, mintAmount);
      assert.equal(events[0].args.newTotalSupply, expectedTotalSupply);
    });

    it("Should emit ContractEvent with TOKENS_MINTED when minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseEther("100");
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
      assert.equal(getAddress(mintEvent.args.actor as string), getAddress(deployer.account.address));
      assert.equal(getAddress(mintEvent.args.target as string), getAddress(recipient.account.address));
      assert.equal(mintEvent.args.value, mintAmount);
    });

    it("Should allow multiple mints", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const mintAmount1 = parseEther("50");
      const mintAmount2 = parseEther("75");

      await token.write.mint([recipient.account.address, mintAmount1]);
      await token.write.mint([recipient.account.address, mintAmount2]);

      assert.equal(
        await token.read.balanceOf([recipient.account.address]),
        mintAmount1 + mintAmount2
      );
      assert.equal(
        await token.read.totalSupply(),
        INITIAL_SUPPLY + mintAmount1 + mintAmount2
      );
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
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseEther("100");
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

    it("Should emit TokensTranferred event on transfer", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseEther("100");
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.transfer([recipient.account.address, transferAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokensTranferred",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.from as string), getAddress(deployer.account.address));
      assert.equal(getAddress(events[0].args.to as string), getAddress(recipient.account.address));
      assert.equal(events[0].args.amount, transferAmount);
    });

    it("Should emit ContractEvent with TOKENS_TRANSFERED on transfer", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const transferAmount = parseEther("100");
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
      assert.equal(getAddress(transferEvent.args.actor as string), getAddress(deployer.account.address));
      assert.equal(getAddress(transferEvent.args.target as string), getAddress(recipient.account.address));
      assert.equal(transferEvent.args.value, transferAmount);
    });

    it("Should revert transfer if insufficient balance", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const excessiveAmount = INITIAL_SUPPLY + parseEther("1");

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
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseEther("200");
      await token.write.approve([spender.account.address, approveAmount]);

      assert.equal(
        await token.read.allowance([owner.account.address, spender.account.address]),
        approveAmount
      );
    });

    it("Should emit TokensApproved event on approval", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [owner, spender] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseEther("200");
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await token.write.approve([spender.account.address, approveAmount]);

      const events = await publicClient.getContractEvents({
        address: token.address,
        abi: token.abi,
        eventName: "TokensApproved",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.owner as string), getAddress(owner.account.address));
      assert.equal(getAddress(events[0].args.spender as string), getAddress(spender.account.address));
      assert.equal(events[0].args.amount, approveAmount);
    });

    it("Should emit ContractEvent with TOKENS_APPROVED on approval", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [owner, spender] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseEther("200");
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
      assert.equal(getAddress(approveEvent.args.actor as string), getAddress(owner.account.address));
      assert.equal(getAddress(approveEvent.args.target as string), getAddress(spender.account.address));
      assert.equal(approveEvent.args.value, approveAmount);
    });

    it("Should allow transferFrom after approval", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [owner, spender, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const approveAmount = parseEther("200");
      const transferAmount = parseEther("150");

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

  describe("ERC20 Standard Compliance", async function () {
    it("Should have correct decimals (18)", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      assert.equal(await token.read.decimals(), 18);
    });

    it("Should maintain correct total supply after multiple operations", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const token = await viem.deployContract("BurnoutToken", [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);

      const mintAmount = parseEther("500");
      const transferAmount = parseEther("200");

      await token.write.mint([recipient.account.address, mintAmount]);
      await token.write.transfer([recipient.account.address, transferAmount]);

      const expectedSupply = INITIAL_SUPPLY + mintAmount;
      assert.equal(await token.read.totalSupply(), expectedSupply);
    });
  });
});

