// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LivenessOracle
/// @notice Permissionless heartbeat registry for ERC-8004 agents on Base.
///         Any agent can record its own heartbeat; anyone can query liveness.
/// @dev No owner, no admin, fully permissionless.
contract LivenessOracle {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Mapping from agentId to the block.timestamp of its last heartbeat
    mapping(uint256 => uint256) private _lastSeen;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted whenever an agent posts a heartbeat
    event Heartbeat(uint256 indexed agentId, uint256 timestamp);

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    /// @notice Record a heartbeat for `agentId` at the current block timestamp.
    ///         Fully permissionless — any address can call this for any agentId.
    /// @param agentId  Numeric ERC-8004 agent identifier (e.g. 22945 for Clawlinker)
    function heartbeat(uint256 agentId) external {
        _lastSeen[agentId] = block.timestamp;
        emit Heartbeat(agentId, block.timestamp);
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
    ///         of the current block timestamp.  Returns false if the agent has
    ///         never posted a heartbeat.
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

    /// @notice Convenience helper: return both lastSeen and isAlive in a single call.
    /// @param agentId          Numeric ERC-8004 agent identifier
    /// @param thresholdSeconds Maximum acceptable age of the last heartbeat (seconds)
    function status(
        uint256 agentId,
        uint256 thresholdSeconds
    ) external view returns (uint256 ts, bool alive) {
        ts = _lastSeen[agentId];
        alive = ts != 0 && (block.timestamp - ts) <= thresholdSeconds;
    }
}
