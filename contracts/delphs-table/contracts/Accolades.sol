// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Accolades is ERC1155, AccessControl, ERC1155Supply, ERC2771Context {
    using EnumerableSet for EnumerableSet.UintSet;

    uint64 public constant VERSION = 1;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private _contractURI;

    mapping(address => EnumerableSet.UintSet) private _userTokens;

    struct BulkMint {
        address to;
        uint256 id;
        uint256 amount;
    }

    constructor(address trustedForwarder, address initialOwner)
        ERC1155("Crypto Colosseum: Accolades")
        ERC2771Context(trustedForwarder)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(URI_SETTER_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
    }

    function userTokens(address userId)
        external
        view
        returns (uint256[] memory)
    {
        return _userTokens[userId].values();
    }

    function setContractURI(string memory newuri)
        public
        onlyRole(URI_SETTER_ROLE)
    {
        _contractURI = newuri;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(account, id, amount, data);
    }

    function multiUserBatchMint(BulkMint[] calldata mints, bytes calldata data)
        public
        onlyRole(MINTER_ROLE)
        returns (bool)
    {
        uint256 len = mints.length;
        for (uint256 i = 0; i < len; i++) {
            BulkMint memory mintInfo = mints[i];
            _mint(mintInfo.to, mintInfo.id, mintInfo.amount, data);
        }
        return true;
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        uint256 len = ids.length;
        for (uint i = 0; i < len; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            if (to != address(0) && amount > 0) {
                _userTokens[to].add(id);
            } 
            if (from != address(0) && ((balanceOf(from, id) - amount) == 0)) {
                _userTokens[from].remove(id);
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
