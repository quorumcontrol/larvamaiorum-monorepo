// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./interfaces/IERC20Minter.sol";

// import "hardhat/console.sol";

contract DelphsGump is
    ERC20,
    ERC20Burnable,
    Pausable,
    AccessControl,
    ERC2771Context
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VESTER_ROLE = keccak256("VESTER_ROLE");

    // allow 1% per hour withdrawl calculated as per block with blocks averagiing 4 seconds
    uint256 public rateOfWithdrawl = 111;
    uint256 public rateDenominator = 10**7;
    // max out at a granularity of about 1000 units of time
    uint256 constant private GRANULARITY = 1000;

    IERC20Minter private _wootgump;

    mapping(address => uint256) private _lastVesting;

    struct BulkMint {
        address to;
        uint256 amount;
    }

    constructor(
        address trustedForwarder,
        address wootgumpAddress,
        address initialOwner
    ) ERC20("Wootgump", "GUMP") ERC2771Context(trustedForwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(VESTER_ROLE, initialOwner);
        _wootgump = IERC20Minter(wootgumpAddress);
    }

    /**
    @notice set the rate at which Delph's Gump can become Wootgump (this is a per-block rate)cal
     */
    function setRateOfWithdrawl(uint256 numerator, uint256 denominator) public onlyRole(VESTER_ROLE) {
      rateOfWithdrawl = numerator;
      rateDenominator = denominator;
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

    function bulkBurn(BulkMint[] calldata burnInfo)
        external
        onlyRole(MINTER_ROLE)
        returns (bool)
    {
        uint256 len = burnInfo.length;
        for (uint256 i = 0; i < len; i++) {
            _burn(burnInfo[i].to, burnInfo[i].amount);
        }
        return true;
    }

    function burn(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _burn(to, amount);
    }

    function vest(address account) public onlyRole(VESTER_ROLE) {
        require(_lastVesting[account] != 0, "no last vest");
        _vest(account);
    }

    function _vest(address account) internal {
        uint256 currentBalance = balanceOf(account);
        if (currentBalance == 0) {
            return;
        }
        uint256 lastVest = _lastVesting[account];
        uint256 time = block.number - lastVest;
        if (time == 0) {
          return;
        }
        // uint256 remainingBalance = (currentBalance * dumbExponent(rateOfWithdrawl, rateDenominator, time)) / rateDenominator;
        uint256 remainingBalance = _remainingBalance(currentBalance, time);
        // console.log("remaining: ", remainingBalance);
        uint256 minting = currentBalance - remainingBalance;
        _burn(account, minting);
        _wootgump.mint(account, minting);
    }

    // The following functions are overrides required by Solidity.

    // function _afterTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) internal override(ERC20) {
    //     super._afterTokenTransfer(from, to, amount);
    // }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        // console.log("_before token transfer", from);
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0)) {
            if (_lastVesting[to] == 0) {
                _lastVesting[to] = block.number;
            }
            _vest(to);
        }
    }

    function _remainingBalance(uint256 starting, uint256 time) internal view returns (uint256) {
      uint256 _rate = rateOfWithdrawl;
      uint256 _denominiator = rateDenominator;
      uint256 multiplier = 1;
      uint256 n = time / GRANULARITY;

      while (n > 0 && (time - (GRANULARITY * multiplier) > GRANULARITY)) {
        multiplier++;
        n = time / (GRANULARITY * multiplier);
      }
      // console.log("multiplier: ", multiplier);

      uint256 steps = (time < GRANULARITY) ? time : GRANULARITY;
      uint256 toSubtract = ((starting * (_rate * multiplier * steps)) / _denominiator);
      
      if (toSubtract > starting) {
        return 0;
      }
      return starting - toSubtract;
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
