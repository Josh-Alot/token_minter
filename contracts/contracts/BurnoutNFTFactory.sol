// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BurnoutNFTStandard} from "./BurnoutNFTStandard.sol";
import {BurnoutNFTDynamic} from "./BurnoutNFTDynamic.sol";

contract BurnoutNFTFactory {
    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string collectionType,
        string name,
        string symbol,
        uint256 timestamp
    );

    mapping(address => address[]) public collectionsByUser;

    function createStandardCollection(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) public returns (address) {
        BurnoutNFTStandard collection = new BurnoutNFTStandard(name, symbol, baseTokenURI);
        collectionsByUser[msg.sender].push(address(collection));

        emit CollectionCreated(msg.sender, address(collection), "STANDARD", name, symbol, block.timestamp);
        return address(collection);
    }

    function createDynamicCollection(
        string memory name,
        string memory symbol
    ) public returns (address) {
        BurnoutNFTDynamic collection = new BurnoutNFTDynamic(name, symbol);
        collectionsByUser[msg.sender].push(address(collection));

        emit CollectionCreated(msg.sender, address(collection), "DYNAMIC", name, symbol, block.timestamp);
        return address(collection);
    }

    function getCollectionsByUser(address user) public view returns (address[] memory) {
        return collectionsByUser[user];
    }
}