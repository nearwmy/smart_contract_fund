const DECIMAL = 8;
const INITIAL_ANSWER = 30000000000;
const LOCK_TIME = 180;
const CONFIRMATIONS = 5;
const developmentChains = ["hardhat", "local"];
const networkConfig = {
  11155111: {
    ethUsdDataFeed: "",
  },
  97: {
    ethUsdDataFeed: "",
  },
};

module.exports = {
  DECIMAL,
  INITIAL_ANSWER,
  LOCK_TIME,
  CONFIRMATIONS,
  networkConfig,
  developmentChains,
};
