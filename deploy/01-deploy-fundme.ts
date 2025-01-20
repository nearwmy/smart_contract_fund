import hre, { network } from "hardhat";
const {
  DECIMAL,
  LOCK_TIME,
  CONFIRMATIONS,
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;

  let dataFeedAddr: any;
  let confirmations: number;

  if (developmentChains.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddr = mockV3Aggregator.address;
    confirmations = 0;
  } else {
    //@ts-ignore
    dataFeedAddr = networkConfig[network?.config?.chainId].ethUsdDataFeed;
    confirmations = CONFIRMATIONS;
  }

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr],
    log: true,
    waitConfirmations: confirmations,
  });

  if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dataFeedAddr],
    });
  } else {
    console.log("Network is not sepolia, verification skipped...");
  }
};

module.exports.tags = ["all", "fundme"];
