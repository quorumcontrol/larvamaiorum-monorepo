// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMetadataPrinter {

  function metadata(uint tokenID) external view returns (string memory);

}