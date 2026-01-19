// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BurnoutERC20Standard is ERC20 {
    event TokenMinted(
        address indexed minter,
        address indexed to,
        uint256 amount,
        uint256 newTotalSupply,
        uint256 timestamp
    );

    event TokenApproved(
        address indexed owner,
        address indexed spender,
        uint256 amount,
        uint256 timestamp
    );

    event TokenTransfered(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 newBalanceFrom,
        uint256 newBalanceTo,
        uint256 timestamp
    );

    event TokenBurned(
        address indexed burner,
        uint256 amount,
        uint256 newTotalSupply,
        uint256 timestamp
    );

    event ContractEvent(
        string eventType,
        address indexed actor,
        address indexed target,
        uint256 value,
        uint256 timestamp
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply); // private call to deploy token, not create new tokens

        emit ContractEvent("TOKEN_DEPLOYED", msg.sender, address(0), _initialSupply, block.timestamp);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);

        emit TokenMinted(msg.sender, to, amount, totalSupply(), block.timestamp);
        emit ContractEvent("TOKENS_MINTED", msg.sender, to, amount, block.timestamp);
    }

    function _update(address from, address to, uint256 amount) internal override {
        super._update(from, to, amount);

        if (from != address(0) && to != address(0)) {
            emit TokenTransfered(from, to, amount, balanceOf(from), balanceOf(to), block.timestamp);
            emit ContractEvent("TOKENS_TRANSFERED", from, to, amount, block.timestamp);
        }

        if (from != address(0) && to == address(0)) {
            emit TokenBurned(from, amount, totalSupply(), block.timestamp);
            emit ContractEvent("TOKENS_BURNED", from, address(0), amount, block.timestamp);
        }
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal override {
        super._approve(owner, spender, value, emitEvent);

        emit TokenApproved(owner, spender, value, block.timestamp);
        emit ContractEvent("TOKENS_APPROVED", owner, spender, value, block.timestamp);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}