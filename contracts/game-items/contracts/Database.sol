// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Database
 * @author 
 * @notice To be honest, this is probably a really bad idea for most chains, but since we're on SKALE we can do some interesting things like store arbitrary blobs of data.
 */
contract Database is AccessControl {

    /**
     * @notice This error is thrown when a user tries to write to a key that has been updated underneath them.
     */
    error ConflictError();
    
    /**
     * @notice This error is thrown when a user tries to insert a record that already exists
     */
    error AlreadyExistsError();

    /**
     * 
     * @param key the key of the data inserted
     * @param hash the hash of the value of the inserted data
     */
    event Inserted(bytes32 indexed key, bytes32 indexed hash);

    /**
     * 
     * @param key the key of the entry removed
     */
    event Removed(bytes32 indexed key);

    /**
     * 
     * @param key the key of the entry set
     * @param hash the hash of the value of the entry set
     */
    event Set(bytes32 indexed key, bytes32 indexed hash);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WRITER = keccak256("WRITER");
    
    mapping (bytes32 => bytes) private _data;
    mapping (bytes32 => bytes32) private _hashes;
    
    constructor(address initialAdmin) {
        _grantRole(ADMIN_ROLE, initialAdmin);
        _grantRole(WRITER, initialAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

    function insert(bytes32 key, bytes calldata value) public onlyRole(WRITER) {
        if (_data[key].length != 0) {
            revert AlreadyExistsError();
        }
        bytes32 hash = keccak256(value);
        _data[key] = value;
        _hashes[key] = hash;
        emit Inserted(key, hash);
    }

    function set(bytes32 key, bytes32 existingHash, bytes calldata value) public onlyRole(WRITER) {
        if (existingHash != _hashes[key]) {
            revert ConflictError();
        }
        bytes32 hash = keccak256(value);
        _data[key] = value;
        _hashes[key] = hash;
        emit Set(key, hash);
    }

    function remove(bytes32 key) public onlyRole(WRITER) {
        delete _data[key];
        delete _hashes[key];
        emit Removed(key);
    }

    function get(bytes32 key) public view returns (bytes memory data, bytes32 hash) {
        return (_data[key], _hashes[key]);
    }
}
