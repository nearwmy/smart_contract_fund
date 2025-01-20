import { network, deployments, getNamedAccounts, ethers } from "hardhat";
import { assert, expect } from "chai";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async () => {
      let fundMe: any;
      let firstAccount: any;
      let mockV3Aggregator: any;

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
      });

      it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.owner(), firstAccount);
      });

      it("test if the datafeed is assigned correctly", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address);
      });

      it("window closed, value grater than minimum, fund failed", async function () {
        // make sure the window is closed
        await helpers.time.increase(200);
        await helpers.mine();
        //value is greater minimum value
        expect(
          fundMe.fund({ value: ethers.parseEther("0.1") })
        ).to.be.revertedWith("window is closed");
      });
    });
