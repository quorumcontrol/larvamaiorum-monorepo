// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "solidity-json-writer/contracts/JsonWriter.sol";

contract PlayerProfile is ERC721, ERC721Enumerable, Pausable, AccessControl, ERC721Burnable {
    using Counters for Counters.Counter;
    using JsonWriter for JsonWriter.Json;

    error UnauthorizedError();
    error NameAlreadyTaken();
    error OnlyOneProfilePerAddress();

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    mapping(bytes32 => bool) private _usedNames;

    mapping(uint256 => Metadata) private _metadata;

    struct Metadata {
        string name;
        string description;
        string image;
        string animationUrl; // The glb file
    }

    constructor(address initialAdmin) ERC721("PlayerProfile", "CCPP") {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialAdmin);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function safeMint(Metadata calldata meta) public {
        address to = msg.sender;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _metadata[tokenId] = meta;
        if(balanceOf(to) > 1) {
            revert OnlyOneProfilePerAddress();
        }
    }

    function uri(uint256 tokenID) public view returns (string memory) {
        JsonWriter.Json memory writer;
        PlayerProfile.Metadata memory meta = _metadata[tokenID];

        writer = writer.writeStartObject();
        writer = writer.writeStringProperty("name", meta.name);
        writer = writer.writeStringProperty("description", meta.description);
        writer = writer.writeStringProperty("image", meta.image);
        writer = writer.writeStringProperty("animation_url", meta.animationUrl);
        writer = writer.writeEndObject();

        return
            string.concat("data:application/json;base64,", Base64.encode(bytes(writer.value)));
    }

    function setMetadata(Metadata calldata meta, uint256 tokenID) public {
        if(!hasRole(MINTER_ROLE, msg.sender) && ownerOf(tokenID) != msg.sender) {
            revert UnauthorizedError();
        }
        Metadata storage existing = _metadata[tokenID];
        
        _usedNames[keccak256(bytes(existing.name))] = false;
        
        if(_usedNames[keccak256(bytes(meta.name))]) {
            revert NameAlreadyTaken();
        }
        _metadata[tokenID] = meta;
    }

    function metadata(uint256 tokenID)
        public
        view
        returns (
            Metadata memory meta
        )
    {
        return _metadata[tokenID];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
