import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseEther } from "viem";

import { network } from "hardhat";

describe("BurnoutERC20Factory", async function () {
  const TOKEN_NAME = "Factory Token";
  const TOKEN_SYMBOL = "FCT";
  const INITIAL_SUPPLY = parseEther("1000");

  describe("Deployment", async function () {
    it("Should deploy factory contract", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const factory = await viem.deployContract("BurnoutERC20Factory", []);

      assert(factory.address !== undefined);
      assert(factory.address !== "0x0000000000000000000000000000000000000000");
    });
  });

  describe("Token Creation", async function () {
    it("Should create a token and deploy BurnoutERC20Standard", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutERC20Factory", []);

      const hash = await factory.write.createToken([
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);
      await publicClient.waitForTransactionReceipt({ hash });

      const tokenAddress = await factory.read.tokensByUser([
        creator.account.address,
        0n,
      ]);

      assert(tokenAddress !== undefined);
      assert(tokenAddress !== "0x0000000000000000000000000000000000000000");

      const token = await viem.getContractAt("BurnoutERC20Standard", tokenAddress);
      assert.equal(await token.read.name(), TOKEN_NAME);
      assert.equal(await token.read.symbol(), TOKEN_SYMBOL);
      assert.equal(await token.read.totalSupply(), INITIAL_SUPPLY);

      // Important behavior note:
      // BurnoutERC20Standard mints initial supply to msg.sender (the factory when created via factory)
      assert.equal(await token.read.balanceOf([factory.address]), INITIAL_SUPPLY);
      assert.equal(await token.read.balanceOf([creator.account.address]), 0n);
    });

    it("Should emit TokenDeployed event when creating token", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutERC20Factory", []);

      const fromBlock = await publicClient.getBlockNumber();

      const hash = await factory.write.createToken([
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
      ]);
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await publicClient.getContractEvents({
        address: factory.address,
        abi: factory.abi,
        eventName: "TokenDeployed",
        fromBlock: fromBlock,
        strict: true,
      });

      assert.equal(events.length, 1);
      assert.equal(
        getAddress(events[0].args.creator as string),
        getAddress(creator.account.address)
      );
      assert.equal(events[0].args.name, TOKEN_NAME);
      assert.equal(events[0].args.symbol, TOKEN_SYMBOL);
      assert.equal(events[0].args.initialSupply, INITIAL_SUPPLY);
    });

    it("Should allow creating multiple tokens for the same user", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutERC20Factory", []);

      const hash1 = await factory.write.createToken([
        "Token 1",
        "TK1",
        parseEther("10"),
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash1 });

      const hash2 = await factory.write.createToken([
        "Token 2",
        "TK2",
        parseEther("20"),
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const token1 = await factory.read.tokensByUser([
        creator.account.address,
        0n,
      ]);
      const token2 = await factory.read.tokensByUser([
        creator.account.address,
        1n,
      ]);

      assert.notEqual(getAddress(token1 as string), getAddress(token2 as string));

      // Out-of-bounds access should reject (indirectly proves only 2 tokens were stored)
      await assert.rejects(
        factory.read.tokensByUser([creator.account.address, 2n])
      );
    });

    it("Should track tokens separately for different users", async function () {
      const connection = await network.connect({
        network: "hardhatMainnet",
        chainType: "l1",
      });
      const viem = (connection as unknown as { viem: any }).viem;
      const publicClient = await viem.getPublicClient();
      const [creator1, creator2] = await viem.getWalletClients();
      const factory = await viem.deployContract("BurnoutERC20Factory", []);

      const hash1 = await factory.write.createToken(
        ["User1 Token", "U1", parseEther("1")],
        { account: creator1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash: hash1 });

      const hash2 = await factory.write.createToken(
        ["User2 Token", "U2", parseEther("2")],
        { account: creator2.account }
      );
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      const tokenUser1 = await factory.read.tokensByUser([
        creator1.account.address,
        0n,
      ]);
      const tokenUser2 = await factory.read.tokensByUser([
        creator2.account.address,
        0n,
      ]);

      assert.notEqual(
        getAddress(tokenUser1 as string),
        getAddress(tokenUser2 as string)
      );
    });
  });
});

