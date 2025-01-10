import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as envEnc from "@chainlink/env-enc";
envEnc.config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`${PRIVATE_KEY}`, `${PRIVATE_KEY_2}`],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: `${ETHERSCAN_API_KEY}`,
    },
  },
  sourcify: {
    enabled: true,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
