import hre from "hardhat";
import * as envEnc from "@chainlink/env-enc";
envEnc.config();

const fs = require("fs");
const path = require("path");

const contractPath = path.resolve(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "FundMe.sol",
  "FundMe.json"
);
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = `${process.env.PRIVATE_KEY}`;

// create main
async function main() {
  // create a provider
  const provider = new hre.ethers.JsonRpcProvider(SEPOLIA_URL);
  // create wallet instance
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY, provider);

  // create contract
  const fundMeFactory = await new hre.ethers.ContractFactory(
    abi,
    bytecode,
    wallet
  );

  const depolyFundMe = async () => {
    console.log("Depolying contract...");

    const fundMe = await fundMeFactory.deploy(30);
    await fundMe.waitForDeployment();
    console.log(
      `contract deployed successfully, contract address is: ${fundMe.getAddress()}`
    );

    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      console.log("Waiting for 5 confirmations");
      await fundMe.deploymentTransaction()?.wait(5);
      await verifyFundMe(fundMe.target.toString(), [30]);
    }
  };
  // depoly contract
  depolyFundMe();

  // verify contract
  const verifyFundMe = async (fundMeAddr: string, args: any[]) => {
    await hre.run("verify:verify", {
      address: fundMeAddr,
      constructorArguments: args,
    });
  };
}

main();
// .then()
// .catch((error) => {
//   console.error("error:", error);
// });
