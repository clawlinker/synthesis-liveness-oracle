// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC721 — minimal interface for ownerOf lookup
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title LivenessOracle
/// @notice Heartbeat registry for ERC-8004 agents on Base.
///         Only the owner of an ERC-8004 token can post heartbeats for that agent.
///         Ownership is verified directly against the ERC-8004 IdentityRegistry on Base.
/// @dev No admin. No proxy. Ownership verified on every heartbeat call.
contract LivenessOracle {
    // -------------------------------------------------------------------------
    // Immutables
    // -------------------------------------------------------------------------

    /// @notice The ERC-8004 IdentityRegistry contract on Base
    IERC721 public immutable identityRegistry;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Mapping from agentId to the block.timestamp of its last heartbeat
    mapping(uint256 => uint256) private _lastSeen;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted whenever an agent posts a heartbeat
    event Heartbeat(uint256 indexed agentId, address indexed sender, uint256 timestamp);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param _identityRegistry Address of the ERC-8004 IdentityRegistry on Base
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "LivenessOracle: zero registry");
        identityRegistry = IERC721(_identityRegistry);
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    /// @notice Record a heartbeat for `agentId` at the current block timestamp.
    ///         Only the current owner of the ERC-8004 token can call this.
    /// @param agentId  Numeric ERC-8004 agent identifier (e.g. 22945 for Clawlinker)
    function heartbeat(uint256 agentId) external {
        require(
            identityRegistry.ownerOf(agentId) == msg.sender,
            "LivenessOracle: caller is not agent owner"
        );
        _lastSeen[agentId] = block.timestamp;
        emit Heartbeat(agentId, msg.sender, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    /// @notice Return the Unix timestamp of the agent's most recent heartbeat.
    ///         Returns 0 if the agent has never posted a heartbeat.
    /// @param agentId  Numeric ERC-8004 agent identifier
    function lastSeen(uint256 agentId) external view returns (uint256) {
        return _lastSeen[agentId];
    }

    /// @notice Return true if the agent's last heartbeat is within `thresholdSeconds`
    ///         of the current block timestamp.
    /// @param agentId          Numeric ERC-8004 agent identifier
    /// @param thresholdSeconds Maximum acceptable age of the last heartbeat (seconds)
    function isAlive(
        uint256 agentId,
        uint256 thresholdSeconds
    ) external view returns (bool) {
        uint256 ts = _lastSeen[agentId];
        if (ts == 0) return false;
        return (block.timestamp - ts) <= thresholdSeconds;
    }

    /// @notice Convenience: return lastSeen, isAlive, and current token owner.
    /// @param agentId          Numeric ERC-8004 agent identifier
    /// @param thresholdSeconds Maximum acceptable age of the last heartbeat (seconds)
    function status(
        uint256 agentId,
        uint256 thresholdSeconds
    ) external view returns (uint256 ts, bool alive, address owner) {
        ts = _lastSeen[agentId];
        alive = ts != 0 && (block.timestamp - ts) <= thresholdSeconds;
        // ownerOf may revert if token doesn't exist — that's fine, it bubbles up
        owner = identityRegistry.ownerOf(agentId);
    }
}
