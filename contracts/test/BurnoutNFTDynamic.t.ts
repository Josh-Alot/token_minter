import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";

import { network } from "hardhat";

describe("BurnoutNFTDynamic", async function () {
  const COLLECTION_NAME = "Dynamic Collection";
  const COLLECTION_SYMBOL = "DYN";
  const TOKEN_URI_1 = "https://api.example.com/tokens/1";
  const TOKEN_URI_2 = "https://api.example.com/tokens/2";
  const TOKEN_URI_3 = "https://api.example.com/tokens/3";

  describe("Deployment", async function () {
    it("Should deploy with correct name and symbol", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
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

      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
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
    });
  });

  describe("Minting", async function () {
    it("Should mint a single token with custom URI", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await collection.write.mint([recipient.account.address, TOKEN_URI_1]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        1n
      );
      assert.equal(
        await collection.read.getTokenURI([0n]),
        TOKEN_URI_1
      );
    });

    it("Should emit TokenMinted event with URI when minting", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      const deploymentBlockNumber = await publicClient.getBlockNumber();

      await collection.write.mint([recipient.account.address, TOKEN_URI_1]);

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
      assert.equal(events[0].args.tokenURI, TOKEN_URI_1);
    });

    it("Should allow multiple mints with different URIs", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await collection.write.mint([recipient.account.address, TOKEN_URI_1]);
      await collection.write.mint([recipient.account.address, TOKEN_URI_2]);
      await collection.write.mint([recipient.account.address, TOKEN_URI_3]);

      assert.equal(
        await collection.read.getTokenURI([0n]),
        TOKEN_URI_1
      );
      assert.equal(
        await collection.read.getTokenURI([1n]),
        TOKEN_URI_2
      );
      assert.equal(
        await collection.read.getTokenURI([2n]),
        TOKEN_URI_3
      );
      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        3n
      );
    });

    it("Should allow batch minting with multiple URIs", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      const tokenURIs = [TOKEN_URI_1, TOKEN_URI_2, TOKEN_URI_3];
      await collection.write.mintBatch([recipient.account.address, tokenURIs]);

      assert.equal(
        await collection.read.balanceOf([recipient.account.address]),
        BigInt(tokenURIs.length)
      );
      assert.equal(
        await collection.read.getTokenURI([0n]),
        TOKEN_URI_1
      );
      assert.equal(
        await collection.read.getTokenURI([1n]),
        TOKEN_URI_2
      );
      assert.equal(
        await collection.read.getTokenURI([2n]),
        TOKEN_URI_3
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
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const tokenURIs = [TOKEN_URI_1, TOKEN_URI_2];

      await collection.write.mintBatch([recipient.account.address, tokenURIs]);

      const events = await publicClient.getContractEvents({
        address: collection.address,
        abi: collection.abi,
        eventName: "TokenMinted",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, tokenURIs.length);
      events.forEach((event, index) => {
        assert.equal(getAddress(event.args.minter as string), getAddress(deployer.account.address));
        assert.equal(getAddress(event.args.to as string), getAddress(recipient.account.address));
        assert.equal(event.args.tokenId, BigInt(index));
        assert.equal(event.args.tokenURI, tokenURIs[index]);
      });
    });

    it("Should revert batch minting with empty URI array", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await assert.rejects(
        collection.write.mintBatch([recipient.account.address, []]),
        /At least one token URI is required/
      );
    });
  });

  describe("Token URI Management", async function () {
    it("Should return correct token URI for minted token", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer, recipient] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await collection.write.mint([recipient.account.address, TOKEN_URI_1]);

      assert.equal(
        await collection.read.getTokenURI([0n]),
        TOKEN_URI_1
      );
    });

    it("Should revert getTokenURI for non-existent token", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const [deployer] = await viem.getWalletClients();
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await assert.rejects(
        collection.read.getTokenURI([0n]),
        /ERC721NonexistentToken/
      );
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
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await collection.write.mint([recipient.account.address, TOKEN_URI_1]);

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
      const collection = await viem.deployContract("BurnoutNFTDynamic", [
        COLLECTION_NAME,
        COLLECTION_SYMBOL,
      ]);

      await collection.write.mint([owner.account.address, TOKEN_URI_1]);
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
      // Token URI should remain the same after transfer
      assert.equal(
        await collection.read.getTokenURI([0n]),
        TOKEN_URI_1
      );
    });
  });
});
