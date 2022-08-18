//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

error UsernameAlreadyClaimed();

contract Player is ERC2771Context {
    event UserNameSet(address indexed player, string username);
    event TeamSet(address indexed player, uint256 indexed team);

    mapping (address => string) public name;
    mapping (string => address) public usernameToAddress;
    mapping (address => uint256) public team;

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function setUsername(string calldata _name) public returns (bool) {
        address sender = _msgSender();
        address existing = usernameToAddress[_name];
        if (!(existing == sender || existing == address(0))) {
            revert UsernameAlreadyClaimed();
        }
        delete usernameToAddress[name[sender]];
        name[sender] = _name;
        usernameToAddress[_name] = sender;
        emit UserNameSet(sender, _name);
        return true;
    }
    function setTeam(uint256 _team) public returns (bool) {
        address sender = _msgSender();
        team[sender] = _team;
        emit TeamSet(sender, _team);
        return true;
    }
}
