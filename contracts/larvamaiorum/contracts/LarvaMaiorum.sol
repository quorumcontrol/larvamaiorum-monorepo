// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC721/presets/LM.sol)

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *  - token ID and URI autogeneration
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 *
 * _Deprecated in favor of https://wizard.openzeppelin.com/[Contracts Wizard]._
 */
contract LarvaMaiorum is
    Context,
    AccessControlEnumerable,
    ERC721Enumerable,
    ERC721Burnable,
    ERC721Pausable
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    event MetadataUriAdded(uint256 indexed index, string uri);

    bytes32 public constant METADATA_SETTER_ROLE = keccak256("MD_SETTER_ROLE");
    bytes32 public constant ALLOW_LIST_ROLE = keccak256("ALLOW_LIST_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    Counters.Counter private _tokenIdTracker;

    string private _baseTokenURI;

    string[] public metadataUris;

    mapping(uint256 => uint256) public tokenIdToMetadataUri;

    mapping(address => uint256) public allowList;

    uint256 public currentlyMinting;

    uint256 public maxSupply;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setupRole(METADATA_SETTER_ROLE, _msgSender());
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = metadataUris[tokenIdToMetadataUri[tokenId]];
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to) public virtual {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "LM: must have minter role to mint"
        );
        _internalMint(to);
    }

    function mintFromAllowList(address to) public virtual {
        require(allowList[to] > 0, "LM: not on list");
        allowList[to]--;
        _internalMint(to);
    }

    function addToAllowList(address to, uint256 amount) public {
      require(hasRole(MINTER_ROLE, _msgSender()), "LM: missing minter role");
      allowList[to] += amount;
    }

    function addMetadataUri(string calldata uri)
        public
        returns (uint256 index)
    {
        require(
            hasRole(METADATA_SETTER_ROLE, _msgSender()),
            "LM: missing metadata setter role"
        );
        metadataUris.push(uri);
        index = metadataUris.length;
        emit MetadataUriAdded(index, uri);
        return index;
    }

    function setCurrentlyMinting(uint256 metadataIndex) public {
        require(
            hasRole(METADATA_SETTER_ROLE, _msgSender()),
            "LM: missing metadata setter role"
        );
        currentlyMinting = metadataIndex;
    }

    function bulkUpdateMetadata(
        uint256 start,
        uint256 length,
        uint256 metadataIndex
    ) public {
        require(
            hasRole(METADATA_SETTER_ROLE, _msgSender()),
            "LM: missing metadata setter role"
        );
        for (uint256 i = start; i < start + length; i++) {
            tokenIdToMetadataUri[i] = metadataIndex;
        }
    }

    function setMaxSupply(uint256 newSupply) public {
        require(
            hasRole(METADATA_SETTER_ROLE, _msgSender()),
            "LM: missing metadata setter role"
        );
        maxSupply = newSupply;
    }

    function _internalMint(address to) internal {
        uint256 current = _tokenIdTracker.current();
        if (current >= maxSupply) {
            revert("maximum supply exceeded");
        }

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        _mint(to, current);
        tokenIdToMetadataUri[current] = currentlyMinting;
        _tokenIdTracker.increment();
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "LM: must have pauser role to pause"
        );
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "LM: must have pauser role to unpause"
        );
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}