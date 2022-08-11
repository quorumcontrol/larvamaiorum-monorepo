//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

// import "hardhat/console.sol";

error Unauthorized();

contract Lobby is AccessControl, ERC2771Context {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event RegisteredInterest(address indexed player);
    event GameStarted(address indexed player, bytes32 indexed notes);

    EnumerableSet.AddressSet private waiting;

    constructor(address trustedForwarder, address initialOwner) ERC2771Context(trustedForwarder) {
        _setupRole(ADMIN_ROLE, initialOwner);
    }

    function registerInterest() public {
        address sender = _msgSender();
        waiting.add(sender);
        emit RegisteredInterest(sender);
    }

    function takeAddresses(address[] calldata addresses, bytes32 notes) public {
        if (!hasRole(ADMIN_ROLE, _msgSender())) {
            revert Unauthorized();
        }
        uint256 len = addresses.length;
        for (uint256 i = 0; i < len; i++) {
            address addr = addresses[i];
            waiting.remove(addr);
            emit GameStarted(addr, notes);
        }
    }

    function cleanAddresses(address[] calldata addresses) public {
        if (!hasRole(ADMIN_ROLE, _msgSender())) {
            revert Unauthorized();
        }
        uint256 len = addresses.length;
        for (uint256 i = 0; i < len; i++) {
            waiting.remove(addresses[i]);
        }
    }

    function waitingAddresses() external view returns (address[] memory) {
      return waiting.values();
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
