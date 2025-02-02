// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没有达到目标值， 投资人可以退款

contract FundMe {
    mapping(address => uint256) public fundersToAmount;
    uint256 constant MINIMUM_VALUE = 5 * 10 ** 18; // USD

    uint256 constant TARGET = 20; // 目标值
    address public owner;
    uint256 totalAmount; 

    uint256 deploymentTimestamp;
    uint256 lockTime;

    AggregatorV3Interface public dataFeed;

    constructor(uint256 _lockTime, address _dataFeedAddr) {
        dataFeed = AggregatorV3Interface(_dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

   

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        fundersToAmount[msg.sender] = msg.value;
        totalAmount += msg.value;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10**8);
    }

    function transferOwnership(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner  {
        require(convertEthToUsd(address(this).balance) >= TARGET, "Target is not reached");
        // transfer: transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);

        // send: transfer ETH and return false if failed
        // payable (msg.sender).send(address(this).balance);

        // call: transfer ETH with data return value of function and bool : recommend 
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "tx is failed");
        fundersToAmount[msg.sender] = 0;
    }

    function refund() external windowClosed{
        require(convertEthToUsd(address(this).balance) < TARGET, "Target is reached");
        require(fundersToAmount[msg.sender] != 0, "there is no fund for you");
        bool success;
        (success,) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "tx is failed");
        fundersToAmount[msg.sender] = 0;
    }

     modifier onlyOwner {
        require(msg.sender == owner, "This function can only be called by owner");
        _;
    }

    modifier windowClosed {
      require(block.timestamp >= deploymentTimestamp + lockTime, 'window is not closed');
      _;
    }
}