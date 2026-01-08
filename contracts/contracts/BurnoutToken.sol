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

    // Token approval event
    event TokensApproved(
        address indexed owner,
        address indexed spender,
        uint256 amount,
        uint256 timestamp
    );
    
    // Token transfer event
    event TokensTranferred(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 newBalanceFrom,
        uint256 newBalanceTo,
        uint256 timestamp
    );

    // Token burn event
    event TokensBurned(
        address indexed burner,
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

    /** TOKEN UPDATES **/
    function _update(address from, address to, uint256 amount) internal override {
        super._update(from, to, amount);

        // token transfer event emitting
        if (from != address(0) && to != address(0)) {
            emit TokensTranferred(from, to, amount, balanceOf(from), balanceOf(to), block.timestamp);
            emit ContractEvent("TOKENS_TRANSFERED", from, to, amount, block.timestamp);
        }

        // token burn event emitting
        if (from != address(0) && to == address(0)) {
            emit TokensBurned(from, amount, totalSupply(), block.timestamp);
            emit ContractEvent("TOKENS_BURNED", from, address(0), amount, block.timestamp);
        }
    }

    /** TOKEN APPROVALS **/
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal override {
        super._approve(owner, spender, value, emitEvent);

        emit TokensApproved(owner, spender, value, block.timestamp);
        emit ContractEvent("TOKENS_APPROVED", owner, spender, value, block.timestamp);
    }

    /** TOKEN BURNING **/
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

}