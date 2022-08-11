// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IMetadataPrinter.sol";

error Unauthorized();
error AlreadyClaimed();

contract BadgeOfAssembly is ERC1155, AccessControl, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    struct BadgeMetadata {
        string name;
        string description;
        string image;
        string animationUrl;
        string youtubeUrl;
        uint256 maxPerWallet;
    }

    bool public gatedAccess = true;
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    string public _contractURI =
        "https://boa.larvamaiorum.com/api/boa";

    IMetadataPrinter private _metadataPrinter;
    Counters.Counter private _tokenId;
    mapping(address => EnumerableSet.UintSet) private _userTokens;
    mapping(address => EnumerableSet.UintSet) private _badgeAdmin;
    mapping(uint256 => BadgeMetadata) public metadata;
    mapping(uint256 => mapping(address => bool)) public minters;

    mapping(uint256 => mapping(address => uint256)) public mints;

    mapping(uint256 => uint256) public totalSupply;

    constructor(address metadataPrinter, address initialOwner) ERC1155("") {
        _setupRole(CREATOR_ROLE, initialOwner);
        _setupRole(ADMIN_ROLE, initialOwner);
        _transferOwnership(initialOwner);
        _metadataPrinter = IMetadataPrinter(metadataPrinter);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setOpenToThePublic(bool isOpen) external returns (bool) {
        if (!hasRole(ADMIN_ROLE, msgSender())) {
            revert Unauthorized();
        }
        gatedAccess = isOpen;
        return true;
    }

    function setContractURI(string calldata newContractURI)
        external
        returns (bool)
    {
        if (!hasRole(ADMIN_ROLE, msgSender())) {
            revert Unauthorized();
        }
        _contractURI = newContractURI;
        return true;
    }

    function setMetadataPrinter(address newContract) external returns (bool) {
        if (!hasRole(ADMIN_ROLE, msgSender())) {
            revert Unauthorized();
        }
        _metadataPrinter = IMetadataPrinter(newContract);
        return true;
    }

    function uri(uint256 tokenID) public view override returns (string memory) {
        return _metadataPrinter.metadata(tokenID);
    }

    function setup(BadgeMetadata calldata _metadata, uint256 initialSupply)
        external
        returns (uint256)
    {
        address sender = msgSender();
        if (gatedAccess && !hasRole(CREATOR_ROLE, sender)) {
            revert Unauthorized();
        }
        _tokenId.increment();
        uint256 nextId = _tokenId.current();
        metadata[nextId] = _metadata;
        minters[nextId][sender] = true;
        if (initialSupply > 0) {
            _mint(sender, nextId, initialSupply, "");
            _userTokens[sender].add(nextId);
            totalSupply[nextId]++;
        }
        _badgeAdmin[sender].add(nextId);
        return nextId;
    }

    function isMinter(uint256 tokenID, address user)
        private
        view
        returns (bool)
    {
        return minters[tokenID][user];
    }

    function mint(
        address to,
        uint256 tokenID,
        uint256 amount
    ) public returns (bool) {
        if (!isMinter(tokenID, msgSender())) {
            revert Unauthorized();
        }
        uint256 oldCount = mints[tokenID][to];
        uint256 max = metadata[tokenID].maxPerWallet;
        if (max > 0 && oldCount + amount > max) {
            revert AlreadyClaimed();
        }
        mints[tokenID][to] = oldCount + amount;
        _mint(to, tokenID, amount, "");
        totalSupply[tokenID]++;
        _userTokens[to].add(tokenID);
        return true;
    }

    function setMinterAccess(
        uint256 tokenID,
        address minter,
        bool canMint
    ) public returns (bool) {
        address sender = msgSender();
        if (!isMinter(tokenID, sender)) {
            revert Unauthorized();
        }
        if (canMint) {
            _badgeAdmin[minter].add(tokenID);
            minters[tokenID][minter] = true;
            return true;
        }

        minters[tokenID][minter] = false;
        _badgeAdmin[minter].remove(tokenID);
        return true;
    }

    function userTokens(address userId)
        external
        view
        returns (uint256[] memory)
    {
        return _userTokens[userId].values();
    }

    function tokenAdminOf(address user)
        external
        view
        returns (uint256[] memory)
    {
        return _badgeAdmin[user].values();
    }

    function updateMetadata(uint256 tokenID, BadgeMetadata calldata newMetadata)
        external
        returns (bool)
    {
        if (!isMinter(tokenID, msgSender())) {
            revert Unauthorized();
        }
        metadata[tokenID] = newMetadata;

        return true;
    }

    function msgSender() private view returns (address) {
        return msg.sender;
    }
}
