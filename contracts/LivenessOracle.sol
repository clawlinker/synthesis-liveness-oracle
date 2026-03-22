// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC721 — minimal interface for ownerOf lookup
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title LivenessOracle
/// @notice Permissionless heartbeat registry for ERC-8004 agents on Base.
///         Only the owner of an ERC-8004 token can post heartbeats for that agent.
///         Ownership is verified on every call via the onchain registry.
/// @dev No admin. No proxy. No fees. Fully permissionless.
contract LivenessOracle {

    /// @notice The ERC-8004 IdentityRegistry contract on Base
    IERC721 public immutable identityRegistry;

    /// @notice agentId → block.timestamp of last heartbeat
    mapping(uint256 => uint256) private _lastSeen;

    /// @notice Emitted on every heartbeat
    event Heartbeat(uint256 indexed agentId, address indexed sender, uint256 timestamp);

    /// @param _identityRegistry Address of the ERC-8004 IdentityRegistry on Base
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "LivenessOracle: zero registry");
        identityRegistry = IERC721(_identityRegistry);
    }

    /// @notice Record a heartbeat. Caller must own the ERC-8004 token.
    /// @param agentId  Numeric ERC-8004 agent identifier
    function heartbeat(uint256 agentId) external {
        require(
            identityRegistry.ownerOf(agentId) == msg.sender,
            "LivenessOracle: not token owner"
        );
        _lastSeen[agentId] = block.timestamp;
        emit Heartbeat(agentId, msg.sender, block.timestamp);
    }

    /// @notice Unix timestamp of most recent heartbeat (0 = never)
    function lastSeen(uint256 agentId) external view returns (uint256) {
        return _lastSeen[agentId];
    }

    /// @notice True if last heartbeat is within thresholdSeconds
    function isAlive(uint256 agentId, uint256 thresholdSeconds) external view returns (bool) {
        uint256 ts = _lastSeen[agentId];
        if (ts == 0) return false;
        return (block.timestamp - ts) <= thresholdSeconds;
    }

    /// @notice Full status. Never reverts — returns address(0) for non-existent tokens.
    function status(uint256 agentId, uint256 thresholdSeconds)
        external
        view
        returns (uint256 ts, bool alive, address owner)
    {
        ts = _lastSeen[agentId];
        alive = ts != 0 && (block.timestamp - ts) <= thresholdSeconds;
        try identityRegistry.ownerOf(agentId) returns (address _owner) {
            owner = _owner;
        } catch {
            owner = address(0);
        }
    }
}
