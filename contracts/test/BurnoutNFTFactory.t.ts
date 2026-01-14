import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress } from "viem";

import { network } from "hardhat";

describe("BurnoutNFTFactory", async function () {
  const STANDARD_COLLECTION_NAME = "Standard Collection";
  const STANDARD_COLLECTION_SYMBOL = "STD";
  const STANDARD_BASE_URI = "https://api.example.com/tokens/";

  const DYNAMIC_COLLECTION_NAME = "Dynamic Collection";
  const DYNAMIC_COLLECTION_SYMBOL = "DYN";

  describe("Deployment", async function () {
    it("Should deploy factory contract", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      assert(factory.address !== undefined);
      assert(factory.address !== "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Standard Collection Creation", async function () {
    it("Should create a standard collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const hash = await factory.write.createStandardCollection([
        STANDARD_COLLECTION_NAME,
        STANDARD_COLLECTION_SYMBOL,
        STANDARD_BASE_URI,
      ]);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      const collectionAddress = events[0].args.collectionAddress as string;

      // Verify collection was created correctly
      const collection = await viem.getContractAt("BurnoutNFTStandard", collectionAddress);
      assert.equal(await collection.read.name(), STANDARD_COLLECTION_NAME);
      assert.equal(await collection.read.symbol(), STANDARD_COLLECTION_SYMBOL);
    });

    it("Should emit CollectionCreated event for standard collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const hash = await factory.write.createStandardCollection([
        STANDARD_COLLECTION_NAME,
        STANDARD_COLLECTION_SYMBOL,
        STANDARD_BASE_URI,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.creator as string), getAddress(creator.account.address));
      assert(events[0].args.collectionAddress !== undefined);
      assert(events[0].args.collectionAddress !== "0x0000000000000000000000000000000000000000");
      assert.equal(events[0].args.collectionType, "STANDARD");
      assert.equal(events[0].args.name, STANDARD_COLLECTION_NAME);
      assert.equal(events[0].args.symbol, STANDARD_COLLECTION_SYMBOL);
    });

    it("Should add standard collection to user's collections list", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const hash = await factory.write.createStandardCollection([
        STANDARD_COLLECTION_NAME,
        STANDARD_COLLECTION_SYMBOL,
        STANDARD_BASE_URI,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const collections = await factory.read.getCollectionsByUser([creator.account.address]);

      assert.equal(collections.length, 1);
      assert(collections[0] !== undefined);
      assert(collections[0] !== "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Dynamic Collection Creation", async function () {
    it("Should create a dynamic collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const hash = await factory.write.createDynamicCollection([
        DYNAMIC_COLLECTION_NAME,
        DYNAMIC_COLLECTION_SYMBOL,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      const collectionAddress = events[0].args.collectionAddress as string;

      // Verify collection was created correctly
      const collection = await viem.getContractAt("BurnoutNFTDynamic", collectionAddress);
      assert.equal(await collection.read.name(), DYNAMIC_COLLECTION_NAME);
      assert.equal(await collection.read.symbol(), DYNAMIC_COLLECTION_SYMBOL);
    });

    it("Should emit CollectionCreated event for dynamic collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const hash = await factory.write.createDynamicCollection([
        DYNAMIC_COLLECTION_NAME,
        DYNAMIC_COLLECTION_SYMBOL,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(getAddress(events[0].args.creator as string), getAddress(creator.account.address));
      assert(events[0].args.collectionAddress !== undefined);
      assert(events[0].args.collectionAddress !== "0x0000000000000000000000000000000000000000");
      assert.equal(events[0].args.collectionType, "DYNAMIC");
      assert.equal(events[0].args.name, DYNAMIC_COLLECTION_NAME);
      assert.equal(events[0].args.symbol, DYNAMIC_COLLECTION_SYMBOL);
    });

    it("Should add dynamic collection to user's collections list", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const hash = await factory.write.createDynamicCollection([
        DYNAMIC_COLLECTION_NAME,
        DYNAMIC_COLLECTION_SYMBOL,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const collections = await factory.read.getCollectionsByUser([creator.account.address]);

      assert.equal(collections.length, 1);
      assert(collections[0] !== undefined);
      assert(collections[0] !== "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Multiple Collections", async function () {
    it("Should allow creating multiple collections by same user", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();

      const hash1 = await factory.write.createStandardCollection([
        "Collection 1",
        "COL1",
        "https://api.example.com/1/",
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash1 });

      const hash2 = await factory.write.createDynamicCollection([
        "Collection 2",
        "COL2",
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const hash3 = await factory.write.createStandardCollection([
        "Collection 3",
        "COL3",
        "https://api.example.com/3/",
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash3 });

      const collections = await factory.read.getCollectionsByUser([creator.account.address]);

      assert.equal(collections.length, 3);
      assert(collections[0] !== undefined);
      assert(collections[1] !== undefined);
      assert(collections[2] !== undefined);
      assert(collections[0] !== "0x0000000000000000000000000000000000000000");
      assert(collections[1] !== "0x0000000000000000000000000000000000000000");
      assert(collections[2] !== "0x0000000000000000000000000000000000000000");
    });

    it("Should track collections separately for different users", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator1, creator2] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const hash1 = await factory.write.createStandardCollection(
        ["Collection 1", "COL1", "https://api.example.com/1/"],
        { account: creator1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash: hash1 });

      const hash2 = await factory.write.createDynamicCollection(
        ["Collection 2", "COL2"],
        { account: creator2.account }
      );
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const collections1 = await factory.read.getCollectionsByUser([creator1.account.address]);
      const collections2 = await factory.read.getCollectionsByUser([creator2.account.address]);

      assert.equal(collections1.length, 1);
      assert.equal(collections2.length, 1);
      assert(collections1[0] !== undefined);
      assert(collections2[0] !== undefined);
      assert(collections1[0] !== "0x0000000000000000000000000000000000000000");
      assert(collections2[0] !== "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Collection Functionality", async function () {
    it("Should allow minting in created standard collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator, recipient] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const hash = await factory.write.createStandardCollection([
        STANDARD_COLLECTION_NAME,
        STANDARD_COLLECTION_SYMBOL,
        STANDARD_BASE_URI,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const collectionAddress = events[0].args.collectionAddress as string;
      const collection = await viem.getContractAt("BurnoutNFTStandard", collectionAddress);
      await collection.write.mint([recipient.account.address]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
    });

    it("Should allow minting in created dynamic collection", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator, recipient] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutNFTFactory", []);

      const deploymentBlockNumber = await publicClient.getBlockNumber();
      const hash = await factory.write.createDynamicCollection([
        DYNAMIC_COLLECTION_NAME,
        DYNAMIC_COLLECTION_SYMBOL,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "CollectionCreated",
        fromBlock: deploymentBlockNumber,
        strict: true,
      });

      const collectionAddress = events[0].args.collectionAddress as string;
      const collection = await viem.getContractAt("BurnoutNFTDynamic", collectionAddress);
      const tokenURI = "https://api.example.com/token/1";
      await collection.write.mint([recipient.account.address, tokenURI]);

      assert.equal(
        getAddress(await collection.read.ownerOf([0n])),
        getAddress(recipient.account.address)
      );
      assert.equal(
        await collection.read.getTokenURI([0n]),
        tokenURI
      );
    });
  });
});
