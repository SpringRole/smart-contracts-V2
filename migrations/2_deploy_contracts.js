const VanityURL = artifacts.require('./VanityURL.sol');
const Attestation = artifacts.require('./Attestation.sol');
const RelayHub = artifacts.require('./RelayHub.sol');

const relayHubAddr = '0x9C57C0F1965D225951FE1B2618C92Eefd687654F';

module.exports = async deployer => {
  deployer.then(async function() {
    let relayHub = await RelayHub.at(relayHubAddr);
    await deployer.deploy(VanityURL, relayHub.address);
    await deployer.deploy(Attestation, relayHub.address);
    await relayHub.depositFor(VanityURL.address, { value: 2e18 });
    await relayHub.depositFor(Attestation.address, { value: 1e18 });
  });
};
