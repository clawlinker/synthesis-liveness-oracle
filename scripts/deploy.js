#!/usr/bin/env node
/**
 * Deploy LivenessOracle to Base mainnet
 * Uses x402 wallet from /etc/clawlinker/keys.env
 * 
 * Usage: node scripts/deploy.js
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_RPC = "https://mainnet.base.org";
const ERC8004_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

// ─── Load key ────────────────────────────────────────────────────────────────

function loadPrivateKey() {
  const envFile = fs.readFileSync("/etc/clawlinker/keys.env", "utf8");
  const match = envFile.match(/X402_PRIVATE_KEY=(.+)/);
  if (!match) throw new Error("X402_PRIVATE_KEY not found in keys.env");
  return match[1].trim();
}

// ─── Load compiled artifacts ─────────────────────────────────────────────────

function loadArtifacts() {
  const binPath = "/tmp/solc-output/contracts_LivenessOracle_sol_LivenessOracle.bin";
  const abiPath = "/tmp/solc-output/contracts_LivenessOracle_sol_LivenessOracle.abi";
  
  const bytecode = "0x" + fs.readFileSync(binPath, "utf8").trim();
  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  
  return { bytecode, abi };
}

// ─── Deploy ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══ LivenessOracle Deploy ═══\n");

  // Setup
  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const wallet = new ethers.Wallet(loadPrivateKey(), provider);
  const { bytecode, abi } = loadArtifacts();

  console.log(`Deployer:  ${wallet.address}`);
  console.log(`Network:   Base mainnet (8453)`);
  console.log(`Registry:  ${ERC8004_REGISTRY}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.0005")) {
    throw new Error("Insufficient ETH for deployment (need ~0.0005 ETH)");
  }

  // Get gas price
  const feeData = await provider.getFeeData();
  console.log(`Gas price: ${ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} gwei\n`);

  // Deploy
  console.log("Deploying...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(ERC8004_REGISTRY);
  
  console.log(`Tx hash:   ${contract.deploymentTransaction().hash}`);
  console.log("Waiting for confirmation...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`\n✅ Deployed at: ${address}`);
  console.log(`BaseScan:  https://basescan.org/address/${address}`);

  // Verify registry is set correctly
  const registryAddr = await contract.identityRegistry();
  console.log(`\nVerification:`);
  console.log(`  identityRegistry() = ${registryAddr}`);
  console.log(`  Expected:            ${ERC8004_REGISTRY}`);
  console.log(`  Match: ${registryAddr.toLowerCase() === ERC8004_REGISTRY.toLowerCase() ? "✅" : "❌"}`);

  // Estimate heartbeat gas for reference
  try {
    const gasEstimate = await contract.heartbeat.estimateGas(28805);
    console.log(`\n  heartbeat(28805) gas estimate: ${gasEstimate.toString()}`);
    const cost = feeData.gasPrice ? ethers.formatEther(gasEstimate * feeData.gasPrice) : "unknown";
    console.log(`  Estimated cost per heartbeat: ${cost} ETH`);
  } catch (e) {
    console.log(`\n  heartbeat gas estimate: skipped (${e.message})`);
  }

  // Output the address for updating constants.ts
  console.log(`\n═══ UPDATE constants.ts ═══`);
  console.log(`export const CONTRACT_ADDRESS = "${address}";`);
}

main().catch((err) => {
  console.error("Deploy failed:", err.message);
  process.exit(1);
});
