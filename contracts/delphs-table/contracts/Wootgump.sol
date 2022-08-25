// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./interfaces/IRanker.sol";
// import "hardhat/console.sol";

contract Wootgump is
    ERC20,
    ERC20Burnable,
    Pausable,
    AccessControl,
    ERC2771Context
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RANKER_SETTER_ROLE = keccak256("RANKER_SETTER");

    IRanker public ranker;

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
        _grantRole(RANKER_SETTER_ROLE, initialOwner);
    }

    function setRanker(address rankerAddress) onlyRole(RANKER_SETTER_ROLE) public {
        ranker = IRanker(rankerAddress);
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

    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) internal override whenNotPaused {
    //     super._beforeTokenTransfer(from, to, amount);
    // }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        super._afterTokenTransfer(from, to, amount);
        ranker.queueRanking(from, balanceOf(from));
        ranker.queueRanking(from, balanceOf(to));
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
