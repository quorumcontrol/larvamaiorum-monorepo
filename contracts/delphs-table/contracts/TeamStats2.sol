// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract TeamStats2 is AccessControl, ERC2771Context {
    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");

    event TeamWin(address indexed player, uint256 indexed team, bytes32 tableId, int256 value);

    constructor(address trustedForwarder, address initialOwner)
        ERC2771Context(trustedForwarder)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SENDER_ROLE, initialOwner);
    }

    struct BulkEmit {
      address player;
      uint256 team;
      bytes32 tableId;
      int256 value;
    }

    function register(BulkEmit[] calldata evts) public onlyRole(SENDER_ROLE) {
      uint256 len = evts.length;
      for (uint256 i = 0; i < len; i++) {
        BulkEmit calldata evt = evts[i];
        emit TeamWin(evt.player, evt.team, evt.tableId, evt.value);
      }
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
