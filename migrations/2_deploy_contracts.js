const CallableEvents = artifacts.require("./CallableEvents.sol");

module.exports = function(deployer) {
  deployer.deploy(CallableEvents);
};
