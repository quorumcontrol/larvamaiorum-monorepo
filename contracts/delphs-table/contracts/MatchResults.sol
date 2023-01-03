// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract MatchResults is AccessControl, ERC2771Context {
    bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");

    mapping(bytes32 => string) public winners;

    event MatchComplete(bytes32 indexed matchId, string indexed winner);

    constructor(address trustedForwarder, address initialOwner)
        ERC2771Context(trustedForwarder)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SENDER_ROLE, initialOwner);
    }

    function registerResults(bytes32 matchId, string calldata winner) public onlyRole(SENDER_ROLE) {
      require(bytes(winners[matchId]).length == 0, "matchId already assigned");
      winners[matchId] = winner;
      emit MatchComplete(matchId, winner);
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
