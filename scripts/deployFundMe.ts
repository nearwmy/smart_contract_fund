import hre from "hardhat";
import { ethers } from "ethers";
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

    const fundMe: any = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(
      `contract deployed successfully, contract address is: ${fundMe.target}`
    );

    // verify fundme
    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      console.log("Waiting for 5 confirmations");
      await fundMe.deploymentTransaction()?.wait(5);
      await verifyFundMe(fundMe.target.toString(), [30]);
    } else {
      console.log("verification skipped..");
    }

    // init 2 accounts
    const [firstAccount, secondAccount] = await hre.ethers.getSigners();

    // fund contract with first account
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.002") });
    await fundTx.wait();

    console.log(
      `2 accounts are ${firstAccount.address} and ${secondAccount.address}`
    );

    // check balance of contract
    const balanceOfContract = await hre.ethers.provider.getBalance(
      fundMe.target
    );
    console.log(`Balance of the contract is ${balanceOfContract}`);

    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe
      .connect(secondAccount)
      .fund({ value: ethers.parseEther("0.002") });
    await fundTxWithSecondAccount.wait();

    // check balance of contract
    const balanceOfContractAfterSecondFund =
      await hre.ethers.provider.getBalance(fundMe.target);
    console.log(
      `Balance of the contract is ${balanceOfContractAfterSecondFund}`
    );

    // check mapping
    const firstAccountbalanceInFundMe = await fundMe.fundersToAmount(
      firstAccount.address
    );
    const secondAccountbalanceInFundMe = await fundMe.fundersToAmount(
      secondAccount.address
    );
    console.log(
      `Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`
    );
    console.log(
      `Balance of second account ${secondAccount.address} is ${secondAccountbalanceInFundMe}`
    );
  };
  // depoly contract
  depolyFundMe();

  // verify contract
  const verifyFundMe = async (fundMeAddr: string, args: any[]) => {
    await hre.run("verify:verify", {
      address: fundMeAddr,
      constructorArguments: args,
      timeout: 300000,
    });
  };
}

main()
  .then()
  .catch((error) => {
    console.error("error:", error);
    process.exit(0);
  });
