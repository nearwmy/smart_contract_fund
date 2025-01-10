import { task } from "hardhat/config";
import { Address } from "web3";

task("depoly-fundme", "depoly and verify fundme contract").setAction(
  async (taskArgs, hre) => {
    // create factory
    const fundMeFactory = await hre.ethers.getContractFactory("FundMe");
    console.log("contract depolying");

    // depoly contract from factory
    const fundMe = await fundMeFactory.deploy(30);
    await fundMe.waitForDeployment();
    console.log(
      `contract has been deployed successfully, contract address is ${fundMe.target}`
    );

    // verify fundme
    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      console.log("Waiting for 5 confirmations");
      await fundMe.deploymentTransaction()?.wait(5);
      await verifyFundMe(fundMe.target as Address, [300]);
    } else {
      console.log("verification skipped..");
    }

    async function verifyFundMe(fundMeAddr: Address, args: any[]) {
      await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
    }
  }
);

module.exports = {};
