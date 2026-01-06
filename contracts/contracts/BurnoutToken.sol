// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BurnoutToken is ERC20 {
    /**  LOGGING EVENTS **/
    // Token deploy event
    event TokenDeployed(
        address indexed deployer,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 timestamp
    );

    // Token mint event
    event TokensMinted(
        address indexed minter,
        address indexed to,
        uint256 amount,
        uint256 newTotalSupply,
        uint256 timestamp
    );

    // Contract change event
    event ContractEvent(
        string eventType,
        address indexed actor,
        address indexed target,
        uint256 value,
        uint256 timestamp
    );
    
    /** TOKEN DEPLOYMENT **/
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);

        emit TokenDeployed(msg.sender, _name, _symbol, _initialSupply, block.timestamp);
        emit ContractEvent("CONTRACT_DEPLOYED", msg.sender, address(0), _initialSupply, block.timestamp);
    }

    /** TOKEN MINTING **/
    function mint(address to, uint256 amount) public {
        _mint(to, amount);

        emit TokensMinted(msg.sender, to, amount, totalSupply(), block.timestamp);
        emit ContractEvent("TOKENS_MINTED", msg.sender, to, amount, block.timestamp);
    }
}