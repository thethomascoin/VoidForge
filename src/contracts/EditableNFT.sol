// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EditableNFT
 * @dev ERC721 token that allows the owner to update token metadata after minting.
 */
contract EditableNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event MetadataUpdated(uint256 indexed tokenId, string newUri);

    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {}

    /**
     * @dev Mints a new NFT.
     * @param to The address that will receive the minted NFT.
     * @param uri The metadata URI for the NFT.
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Updates the metadata URI for a specific token.
     * This is the "special" feature requested.
     * @param tokenId The ID of the token to update.
     * @param newUri The new metadata URI.
     */
    function updateTokenURI(uint256 tokenId, string memory newUri) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newUri);
        emit MetadataUpdated(tokenId, newUri);
    }
}
