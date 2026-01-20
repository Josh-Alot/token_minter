// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BurnoutERC20Standard} from "./BurnoutERC20Standard.sol";

contract BurnoutERC20Factory {
    event TokenDeployed(
        address indexed creator,
        string name,
        string symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 timestamp
    );

    mapping(address => address[]) public tokensByUser;

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    ) public returns (address) {
        BurnoutERC20Standard token = new BurnoutERC20Standard(name, symbol, decimals, initialSupply);
        tokensByUser[msg.sender].push(address(token));

        emit TokenDeployed(msg.sender, name, symbol, decimals, initialSupply, block.timestamp);
        return address(token);
    }

    
}