// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRanker {
  
  function queueRanking(address user, uint256 balance) external;
  
}