//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
// import "hardhat/console.sol";

contract ListKeeper is AccessControl, ERC2771Context {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error Unauthorized();
    error AlreadyUsed();
    error SizeExceeded();

    event EntryAdded(bytes32 indexed list, bytes32 indexed entry);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(bytes32 => EnumerableSet.Bytes32Set) private _lists;
    mapping(bytes32 => uint256) public listSize;

    constructor(address trustedForwarder, address initialOwner)
        ERC2771Context(trustedForwarder)
    {
        // do the access control
        _setupRole(ADMIN_ROLE, initialOwner);
        _setupRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    function setMaxListSize(bytes32 list, uint256 maxSize) external onlyRole(ADMIN_ROLE) {
        listSize[list] = maxSize;
    }

    function count(bytes32 list) external view returns (uint256) {
        return _lists[list].length();
    }

    function contains(bytes32 list, bytes32 entry) external view returns (bool) {
        return _lists[list].contains(entry);
    }

    function add(bytes32 listName, bytes32 entry) external returns (bool) {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        
        EnumerableSet.Bytes32Set storage list = _lists[listName];
        // console.log("contains? ", list.contains(entry));
        if (list.contains(entry)) {
            revert AlreadyUsed();
        }
        
        uint256 maxSize = listSize[listName];
        // console.log("maxSize / length", list.length(), maxSize);
        if (maxSize > 0 && list.length() >= maxSize) {
            revert SizeExceeded();
        } 

        list.add(entry);
        
        emit EntryAdded(listName, entry);
        
        return true;
    }

    function remove(bytes32 list, bytes32 tableId) external returns (bool) {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        _lists[list].remove(tableId);
        return true;
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
