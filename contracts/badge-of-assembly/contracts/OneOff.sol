// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// we mostly just have this here so that the IERC721 types get built
contract OneOff is ERC721 {

  constructor() ERC721("", "") {}
}
