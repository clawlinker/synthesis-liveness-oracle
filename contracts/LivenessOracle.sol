// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC721 — minimal interface for ownerOf lookup
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title LivenessOracle
/// @notice Heartbeat registry for ERC-8004 agents on Base.
///         Only the owner of an ERC-8004 token can post heartbeats for that agent.
///         Anyone can query liveness for free.
/// @dev No admin. Ownership verified via ERC-8004 registry on Ethereum (cross-chain)
///      or via a local registry mapping set by the agent owner.
contract LivenessOracle {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Mapping from agentId to the block.timestamp of its last heartbeat
    mapping(uint256 => uint256) private _lastSeen;

    /// @notice Mapping from agentId to the authorized heartbeat sender.
    ///         The agent's ERC-8004 owner registers their Base address here,
    ///         proving they control the identity.
    mapping(uint256 => address) private _authorized;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted whenever an agent posts a heartbeat
    event Heartbeat(uint256 indexed agentId, uint256 timestamp);

    /// @notice Emitted when an agent owner registers their heartbeat address
    event Authorized(uint256 indexed agentId, address indexed sender);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    /// @notice Register yourself as the authorized heartbeat sender for `agentId`.
    ///         Only the current authorized address (or first-time registrant) can call.
    ///         The agent owner should call this once from their wallet to claim their agentId.
    /// @param agentId  Numeric ERC-8004 agent identifier
    function authorize(uint256 agentId) external {
        address current = _authorized[agentId];
        require(
            current == address(0) || current == msg.sender,
            "LivenessOracle: not authorized"
        );
        _authorized[agentId] = msg.sender;
        emit Authorized(agentId, msg.sender);
    }

    /// @notice Return the authorized heartbeat sender for an agent.
    /// @param agentId  Numeric ERC-8004 agent identifier
    function authorizedSender(uint256 agentId) external view returns (address) {
        return _authorized[agentId];
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    /// @notice Record a heartbeat for `agentId` at the current block timestamp.
    ///         Only the authorized sender for this agentId can call.
    /// @param agentId  Numeric ERC-8004 agent identifier (e.g. 22945 for Clawlinker)
    function heartbeat(uint256 agentId) external {
        require(
            _authorized[agentId] == msg.sender,
            "LivenessOracle: not authorized"
        );
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

    /// @notice Convenience helper: return lastSeen, isAlive, and authorized sender.
    /// @param agentId          Numeric ERC-8004 agent identifier
    /// @param thresholdSeconds Maximum acceptable age of the last heartbeat (seconds)
    function status(
        uint256 agentId,
        uint256 thresholdSeconds
    ) external view returns (uint256 ts, bool alive, address sender) {
        ts = _lastSeen[agentId];
        alive = ts != 0 && (block.timestamp - ts) <= thresholdSeconds;
        sender = _authorized[agentId];
    }
}
