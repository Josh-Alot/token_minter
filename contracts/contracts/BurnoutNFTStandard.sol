// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BurnoutNFTStandard is ERC721, Ownable {
    string private _baseTokenURI;
    uint256 private _tokenIdCounter;

    event TokenMinted(
        address indexed minter,
        address indexed to,
        uint256 tokenId,
        uint256 timestamp
    );

    event CollectionCreated(
        address indexed creator,
        string name,
        string symbol,
        string baseURL,
        uint256 timestamp
    );

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
        emit CollectionCreated(msg.sender, name, symbol, baseTokenURI, block.timestamp);
    }

    function _getBaseURI() internal view returns (string memory) {
        return _baseTokenURI;
    }

    function mint(address to) public {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        emit TokenMinted(msg.sender, to, tokenId, block.timestamp);
    }

    function mintBatch(address to, uint256 quantity) public {
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(to, tokenId);
            emit TokenMinted(msg.sender, to, tokenId, block.timestamp);
        }
    }
}