import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";

import { network } from "hardhat";

describe("BurnoutNFTStandard", async function () {
  const COLLECTION_NAME = "Standard Collection";
  const COLLECTION_SYMBOL = "STD";
  const BASE_TOKEN_URI = "https://api.example.com/tokens/";

  describe("Deployment", async function () {
    it("Should deploy with correct name, symbol and base URI", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      assert.equal(await collection.read.name(), COLLECTION_NAME);
      assert.equal(await collection.read.symbol(), COLLECTION_SYMBOL);
      assert.equal(getAddress(await collection.read.owner()), getAddress(deployer.account.address));
    });

    it("Should emit CollectionCreated event on deployment", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer] = await viem.getWalletClients();
      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      const events = await publicClient.getContractEvents({
        address: collection.address,
        abi: collection.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.creator as string), getAddress(deployer.account.address));
      assert.equal(events[0].args.name, COLLECTION_NAME);
      assert.equal(events[0].args.symbol, COLLECTION_SYMBOL);
      assert.equal(events[0].args.baseURL, BASE_TOKEN_URI);
    });
  });

  describe("Minting", async function () {
    it("Should mint a single token to specified address", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      await collection.write.mint([recipient.account.address]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        1n
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
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await collection.write.mint([recipient.account.address]);

      const events = await publicClient.getContractEvents({
        address: collection.address,
        abi: collection.abi,
        eventName: "TokenMinted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.minter as string), getAddress(deployer.account.address));
      assert.equal(getAddress(events[0].args.to as string), getAddress(recipient.account.address));
      assert.equal(events[0].args.tokenId, 0n);
    });

    it("Should allow multiple mints with sequential token IDs", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      await collection.write.mint([recipient.account.address]);
      await collection.write.mint([recipient.account.address]);
      await collection.write.mint([recipient.account.address]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        getAddress(await collection.read.ownerOf([1n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        getAddress(await collection.read.ownerOf([2n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        3n
      );
    });

    it("Should allow batch minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      const quantity = 5n;
      await collection.write.mintBatch([recipient.account.address, quantity]);

      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        quantity
      );
      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        getAddress(await collection.read.ownerOf([4n])),
        getAddress(recipient.account.address)
      );
    });

    it("Should emit multiple TokenMinted events for batch minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const quantity = 3n;

      await collection.write.mintBatch([recipient.account.address, quantity]);

      const events = await publicClient.getContractEvents({
        address: collection.address,
        abi: collection.abi,
        eventName: "TokenMinted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, Number(quantity));
      events.forEach((event, index) => {
        assert.equal(getAddress(event.args.minter as string), getAddress(deployer.account.address));
        assert.equal(getAddress(event.args.to as string), getAddress(recipient.account.address));
        assert.equal(event.args.tokenId, BigInt(index));
      });
    });
  });

  describe("ERC721 Standard Compliance", async function () {
    it("Should support standard ERC721 functions", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      await collection.write.mint([recipient.account.address]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        1n
      );
    });

    it("Should allow token transfer", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, owner, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      await collection.write.mint([owner.account.address]);
      await collection.write.transferFrom(
        [owner.account.address, recipient.account.address, 0n],
        { account: owner.account }
      );

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.balanceOf([owner.account.address]),
        0n
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        1n
      );
    });

    it("Should revert transfer if not owner", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, owner, unauthorized] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTStandard", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
        BASE_TOKEN_URI,
      ]);

      await collection.write.mint([owner.account.address]);

      await assert.rejects(
        collection.write.transferFrom(
          [owner.account.address, unauthorized.account.address, 0n],
          { account: unauthorized.account }
        ),
        /ERC721InsufficientApproval|ERC721IncorrectOwner/
      );
    });
  });
});
