// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "solidity-linked-list/contracts/StructuredLinkedList.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
// import "hardhat/console.sol";

contract Wootgump is
    ERC20,
    ERC20Burnable,
    Pausable,
    AccessControl,
    ERC2771Context
{
    using StructuredLinkedList for StructuredLinkedList.List;
    StructuredLinkedList.List private list;

    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public constant MAX_RANKING_SIZE = 10000;
    uint256 private constant _HEAD = 0;
    bool private constant _NEXT = true;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(uint256 => EnumerableSet.AddressSet) private valuesToAddresses;

    struct BulkMint {
        address to;
        uint256 amount;
    }

    constructor(address trustedForwarder, address initialOwner)
        ERC20("Wootgump", "GUMP")
        ERC2771Context(trustedForwarder)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function bulkMint(BulkMint[] calldata mintInfo)
        external
        onlyRole(MINTER_ROLE)
        returns (bool)
    {
        uint256 len = mintInfo.length;
        for (uint256 i = 0; i < len; i++) {
            _mint(mintInfo[i].to, mintInfo[i].amount);
        }
        return true;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function rankedValues(uint256 max) public view returns (uint256[] memory vals) {
        vals = new uint256[](max);
        (bool exists, uint256 node) = list.getNextNode(_HEAD);
        uint256 i = 0;
        while (exists && i < max) {
            vals[i] = node;
            (exists, node) = list.getNextNode(node);
            i++;
        }
        return vals;
    }

    function addressesForValue(uint256 value) external view returns (address[] memory) {
        return valuesToAddresses[value].values();
    }

    function removeUserFromValue(address user) internal {
        if (user == address(0)) {
            return;
        }
        uint256 balance = balanceOf(user);
        EnumerableSet.AddressSet storage set = valuesToAddresses[balance];
        set.remove(user);
        if (set.length() == 0) {
            list.remove(balance);
        }
    }

    function sortUser(address user) internal {
        if (user == address(0)) {
            return;
        }
        // console.log("sort user", user);
        uint256 balance = balanceOf(user);
        valuesToAddresses[balance].add(user);
        if (!list.nodeExists(balance)) {
            // console.log("insert");
            list.insertAfter(getSortedSpot(balance), balance);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        removeUserFromValue(from);
        removeUserFromValue(to);
        super._beforeTokenTransfer(from, to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        super._afterTokenTransfer(from, to, amount);
        sortUser(from);
        sortUser(to);
    }

    // function _mint(address to, uint256 amount)
    //     internal
    //     override(ERC20)
    // {
    //     super._mint(to, amount);
    // }

    // function _burn(address account, uint256 amount)
    //     internal
    //     override(ERC20)
    // {
    //     super._burn(account, amount);
    // }

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

    function getSortedSpot(uint256 _value) internal view returns (uint256) {
        if (list.sizeOf() == 0) {
            return 0;
        }

        uint256 next;
        (, next) = list.getAdjacent(_HEAD, _NEXT);
        while ((next != 0) && ((_value < next) != _NEXT)) {
            next = list.list[next][_NEXT];
        }
        return next;
    }
}
