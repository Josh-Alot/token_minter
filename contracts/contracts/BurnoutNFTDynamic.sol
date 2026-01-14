// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BurnoutNFTDynamic is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    event TokenMinted(
        address indexed minter,
        address indexed to,
        uint256 tokenId,
        string tokenURI,
        uint256 timestamp
    );

    event CollectionCreated(
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        emit CollectionCreated(msg.sender, name, symbol, block.timestamp);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function mint(address to, string memory tokenURI_) public {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = tokenURI_;
        _safeMint(to, tokenId);
        emit TokenMinted(msg.sender, to, tokenId, tokenURI_, block.timestamp);
    }

    function mintBatch(address to, string[] memory tokenURIs) public {
        require(tokenURIs.length > 0, "At least one token URI is required, it must not be empty");
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _tokenURIs[tokenId] = tokenURIs[i];
            _safeMint(to, tokenId);
            emit TokenMinted(msg.sender, to, tokenId, tokenURIs[i], block.timestamp);
        }
    }
}