// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IRanker.sol";
// import "hardhat/console.sol";

contract Ranker is IRanker
{
    error FourOhOneUnauthorized();

    using EnumerableSet for EnumerableSet.AddressSet;

    struct Node {
      address user;
      uint256 balance;
      
      uint256 next;
      uint256 prev;
    }

    uint256 public constant MAX_RANKINGS = 500;

    mapping(uint256 => Node) private _nodes;
    
    uint256 private _nextId = 0;

    uint256 private constant _HEAD = 0;
    uint256 private _tail = 0;
    uint256 private _count = 1;

    address immutable _wootgumpContract;

    mapping(address => uint256) private _queuedBalances;
    EnumerableSet.AddressSet private _queuedAddresses;

    mapping(address => uint256) private _nodeForAddress;

    constructor(address wootgumpContractAddress) {
      _wootgumpContract = wootgumpContractAddress;
    }

    function queueRanking(address user, uint256 balance) override public {
      if (msg.sender != _wootgumpContract) {
        revert FourOhOneUnauthorized();
      }
      _queuedAddresses.add(user);
      _queuedBalances[user] = balance;
    }

    function clearRankingQueue(uint256 max) public {
      address[] memory queuedUsers = new address[](max);
      for (uint256 i = 0; i < max; i++) {
        // console.log('get queued at ', i);
        queuedUsers[i] = _queuedAddresses.at(i);
      }
      uint256 len = queuedUsers.length;
      for (uint256 i = 0; i < len; i++) {
        address addr = queuedUsers[i];
        // console.log("ranking", addr);
        rank(addr, _queuedBalances[addr]);
        _queuedAddresses.remove(addr);
      }
      possiblyTrimTail();
    }

    function ranked(uint256 userMax) public view returns (address[] memory) {
      uint256 max = userMax > 0 ? userMax : _count - 1;

      address[] memory rankedUsers = new address[](max);
      (uint256 id, Node storage node) = getNext(_nodes[_HEAD]);
      for (uint256 i = 0; i < max; i++) {
        rankedUsers[i] = node.user;
        // console.log("get next for", id);
        (id,node) = getNext(node);
        // console.log("next", id);
      }
      return rankedUsers;
    }

    function pendingRankings(uint256 max) public view returns (address[] memory) {
      if (max == 0) {
        return _queuedAddresses.values();
      }
      address[] memory queuedUsers = new address[](max);
      for (uint256 i = 0; i < max; i++) {
        queuedUsers[i] = _queuedAddresses.at(i);
      }
      return queuedUsers;
    }

    //TODO: protect caller
    function rank(address user, uint256 balance) internal {
      removeNode(_nodeForAddress[user]); // #removeNode handles the no node returned case.
      if (balance == 0) {
        // console.log("zero balance return");
        return;
      }
      if (_count >= MAX_RANKINGS && balance < _nodes[_tail].balance) {
        // console.log("_count or lower balance return");
        return; // nothing to do here
      }
      (uint256 id, Node storage node) = findPosition(balance);
      // console.log("insert after", id);
      _nodeForAddress[user] = insertAfter(id, node, user, balance);
    }

    function possiblyTrimTail() internal {
      uint256 count = _count;
      if (count <= MAX_RANKINGS) {
        return; // no trim until big
      }
      uint256 amountToTrim = count - MAX_RANKINGS;
      uint256 id = _tail;
      Node storage tailNode = _nodes[id];

      for (uint256 i = 0; i < amountToTrim; i++) {
        (id, tailNode) = getPrev(tailNode);
      }
      tailNode.next = _HEAD;
      _tail = id;
      _count = count - amountToTrim;
    }

    function insertAfter(uint256 existingId, Node storage existingNode, address user, uint256 balance) internal returns (uint256 id) {
      id = _nextId++;
      Node memory newNode = Node({
        user: user,
        balance: balance,
        prev: existingId,
        next: existingNode.next
      });
      existingNode.next = id;
      _nodes[id] = newNode;
      if (existingNode.prev == _HEAD) {
        _tail = id;
      }
      _count++;
      return id;
    }

    function findPosition(uint256 balance) internal view returns (uint256 id, Node storage) {
      Node storage currentNode = _nodes[_tail];
      id = _tail;
      // console.log("before while");
      while (currentNode.balance < balance) {
        (id, currentNode) = getPrev(currentNode);
        // console.log('currentNode', id, currentNode.next);
        // console.log(currentNode.balance < balance);
        if (id == _HEAD) {
          break;
        }
      }
      // console.log('after while', id);
      return (id, currentNode);
    }

    function removeNode(uint256 id) internal {
      if (id == 0) {
        return;
      }
      Node storage node = _nodes[id];
      (uint256 prevId, Node storage prev) = getPrev(node);
      (uint256 nextId, Node storage next) = getNext(node);
      prev.next = nextId;
      next.prev = prevId;
      if (id == _tail) {
        _tail = prevId;
      }
      _count--;
    }

    function getPrev(Node storage node) internal view returns (uint256 id, Node storage) {
      id = node.prev;
      return (id, _nodes[id]);
    }

    function getNext(Node memory node) internal view returns (uint256 id, Node storage) {
      id = node.next;
      return (id, _nodes[id]);
    }

}
