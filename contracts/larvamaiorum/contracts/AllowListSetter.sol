//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error Unauthorized();

contract AllowListSetter is AccessControl, ERC2771Context {
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    using SafeERC20 for IERC20;

    string private constant MISSING_ADMIN_ROLE = "missing admin role";

    event SupplyAdded(uint256 amount);
    event Purchase(address indexed account);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    EnumerableMap.AddressToUintMap private _allowListSpots;

    IERC20 private _wootGump;

    uint256 currentPrice;
    uint256 supply;

    bool paused;

    struct Balance {
        address account;
        uint256 balance;
    }

    constructor(
        address trustedForwarder,
        address wootGumpAddress,
        address initialOwner
    ) ERC2771Context(trustedForwarder) {
        // do the access control
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _wootGump = IERC20(wootGumpAddress);
    }

    function buy(address account) public {
        require(!paused, "buying stopped");
        _wootGump.safeTransferFrom(_msgSender(), address(this), currentPrice);
        supply--;
        require(supply >= 0, "no more supply");
        (,uint256 currentBalance) = _allowListSpots.tryGet(account);
        _allowListSpots.set(account, currentBalance + 1);
        emit Purchase(account);
    }

    function addSupply(uint256 amount) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        supply += amount;
    }

    function setPaused(bool isPaused) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        paused = isPaused;
    }

    function drain(address to) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        uint256 balance = _wootGump.balanceOf(address(this));
        _wootGump.transfer(to, balance);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _allowListSpots.get(account);
    }

    function consume(address account) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        _allowListSpots.set(account, 0);
    }

    function setCurrentPrice(uint256 price) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        currentPrice = price;
    }

    function bulkConsume(address[] calldata accounts) public {
        require(hasRole(ADMIN_ROLE, _msgSender()), MISSING_ADMIN_ROLE);
        uint256 len = accounts.length;
        for (uint256 i; i < len; i++) {
            _allowListSpots.set(accounts[i], 0);
        }
    }

    function all() public view returns (Balance[] memory balances) {
        uint256 len = _allowListSpots.length();
        balances = new Balance[](len);
        for (uint256 i; i < len; i++) {
            (address account, uint256 balance) = _allowListSpots.at(i);
            balances[i] = Balance({account: account, balance: balance});
        }
        return balances;
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
