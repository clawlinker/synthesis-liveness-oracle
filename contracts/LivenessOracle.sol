// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC721 — minimal interface for ownerOf lookup
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title LivenessOracle
/// @notice Permissionless heartbeat registry for ERC-8004 agents on Base.
///
///         Any agent with an ERC-8004 identity on Base can register and heartbeat.
///         The contract supports two auth models:
///
///         1. **Direct:** The 8004 token owner calls heartbeat() directly.
///         2. **Delegated:** The owner authorizes an operator address (e.g. a Bankr
///            wallet, a cron bot, a different EOA) to heartbeat on its behalf.
///            This is the realistic path — most agents don't transact from
///            the same wallet that owns their 8004 token.
///
///         Self-service flow for any agent:
///         1. Register your 8004 ID on Base (via 8004 registry)
///         2. Call authorize(agentId, operatorAddress) from the owner wallet
///         3. Heartbeat from the operator wallet forever — no more owner txs needed
///
/// @dev No admin. No proxy. No fees. Fully permissionless.
contract LivenessOracle {
    // -------------------------------------------------------------------------
    // Immutables
    // -------------------------------------------------------------------------

    /// @notice The ERC-8004 IdentityRegistry contract on Base
    IERC721 public immutable identityRegistry;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice agentId → block.timestamp of last heartbeat
    mapping(uint256 => uint256) private _lastSeen;

    /// @notice agentId → operator address authorized to heartbeat
    ///         address(0) means no delegate — only owner can heartbeat
    mapping(uint256 => address) public operators;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted on every heartbeat
    event Heartbeat(uint256 indexed agentId, address indexed sender, uint256 timestamp);

    /// @notice Emitted when an operator is authorized or revoked
    event OperatorSet(uint256 indexed agentId, address indexed operator);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param _identityRegistry Address of the ERC-8004 IdentityRegistry on Base
    constructor(address _identityRegistry) {
        require(_identityRegistry != address(0), "LivenessOracle: zero registry");
        identityRegistry = IERC721(_identityRegistry);
    }

    // -------------------------------------------------------------------------
    // Auth
    // -------------------------------------------------------------------------

    /// @notice Authorize an operator to heartbeat on behalf of agentId.
    ///         Must be called by the current owner of the 8004 token.
    ///         Pass address(0) to revoke.
    /// @param agentId  The ERC-8004 agent token ID
    /// @param operator The address allowed to call heartbeat(agentId)
    function authorize(uint256 agentId, address operator) external {
        require(
            identityRegistry.ownerOf(agentId) == msg.sender,
            "LivenessOracle: not token owner"
        );
        operators[agentId] = operator;
        emit OperatorSet(agentId, operator);
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    /// @notice Record a heartbeat for agentId. Caller must be either:
    ///         - the current 8004 token owner, OR
    ///         - the authorized operator for this agentId
    /// @param agentId  Numeric ERC-8004 agent identifier
    function heartbeat(uint256 agentId) external {
        address owner = identityRegistry.ownerOf(agentId);
        require(
            msg.sender == owner || msg.sender == operators[agentId],
            "LivenessOracle: unauthorized"
        );
        _lastSeen[agentId] = block.timestamp;
        emit Heartbeat(agentId, msg.sender, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    /// @notice Unix timestamp of most recent heartbeat (0 = never)
    function lastSeen(uint256 agentId) external view returns (uint256) {
        return _lastSeen[agentId];
    }

    /// @notice True if last heartbeat is within thresholdSeconds
    function isAlive(
        uint256 agentId,
        uint256 thresholdSeconds
    ) external view returns (bool) {
        uint256 ts = _lastSeen[agentId];
        if (ts == 0) return false;
        return (block.timestamp - ts) <= thresholdSeconds;
    }

    /// @notice Full status: lastSeen, alive flag, owner, operator
    function status(
        uint256 agentId,
        uint256 thresholdSeconds
    )
        external
        view
        returns (
            uint256 ts,
            bool alive,
            address owner,
            address operator
        )
    {
        ts = _lastSeen[agentId];
        alive = ts != 0 && (block.timestamp - ts) <= thresholdSeconds;
        owner = identityRegistry.ownerOf(agentId);
        operator = operators[agentId];
    }
}
