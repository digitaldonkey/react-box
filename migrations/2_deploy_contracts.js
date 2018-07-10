const TestEventHandling = artifacts.require("./TestEventHandling.sol");

module.exports = function(deployer) {
  deployer.deploy(TestEventHandling);
};
