const VanityURL = artifacts.require('./VanityURL.sol');
const Attestation = artifacts.require('./Attestation.sol');
const relayHubAddr = '0x9C57C0F1965D225951FE1B2618C92Eefd687654F';

module.exports = async deployer => {
  deployer.then(async function() {
    let vanityURl = await deployer.deploy(VanityURL, relayHubAddr);
    let attestation = await deployer.deploy(Attestation, relayHubAddr);
    await vanityURl.deposit({ value: 1e18 });
    await attestation.deposit({ value: 1e18 });
  });
};
