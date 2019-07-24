pragma solidity ^0.5.5;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "tabookey-gasless/contracts/IRelayHub.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";


/**
 * Attestation contract to enter event data for all attestations
 */
contract Attestation is Ownable, RelayRecipient {

    event Attest(address _address, string _type, string _data);
    event AttestByOwner(string _address, string _type, string _data);

    event RecipientPreCall();
    event RecipientPostCall(uint256 transactionFee, uint256 gasPrice, uint256 actualCharge, bool success, bytes32 preRetVal);


    mapping (address => bool) public relaysWhitelist;
    
    address public blacklisted;
    bool public rejectAcceptRelayCall;

    constructor(IRelayHub rhub) public {
        setRelayHub(rhub);
    }

    function deposit() public payable {
        getRelayHub().depositFor.value(msg.value)(address(this));
    }

    function withdraw() public onlyOwner {
        uint256 balance = withdrawAllBalance();
        msg.sender.transfer(balance);
    }

    function setRejectAcceptRelayCall(bool val) public onlyOwner {
        rejectAcceptRelayCall = val;
    }

    /**
     * Function use by user to attest
     */
    function write(string memory _type, string memory _data) public returns (bool) {
        emit Attest(getSender(), _type, _data);
        return true;
    }

    /**
     * Function use by DApp owner to be committed in case of data migration
     */
    function writeByOwner(string memory _type, string memory _data, string memory _address) public onlyOwner returns (bool) {
        emit AttestByOwner(_address, _type, _data);
        return true;
    }
    
    function acceptRelayedCall(
        address relay,
        address from,
        bytes calldata encodedFunction,
        uint256 transactionFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 nonce,
        bytes calldata approvalData,
        uint256 maxPossibleCharge
    )
        external view returns (uint256, bytes memory) 
    {
        if (relaysWhitelist[relay]) {
            return (0, "");
        }
        
        if (from == blacklisted) {
            return (3, "");
        }

        return (0, abi.encode(relay, from, encodedFunction, transactionFee, gasPrice, gasLimit, nonce, approvalData, maxPossibleCharge));
    }

    function preRelayedCall(bytes calldata context) external returns (bytes32) {
        emit RecipientPreCall();
        return bytes32(uint(123456));
    }

    function postRelayedCall(bytes calldata context, bool success, uint actualCharge, bytes32 preRetVal) external {
        ( , , , uint256 transactionFee, uint256 gasPrice, , , , ) = abi.decode(context, (
            address, address, bytes, uint256, uint256, uint256, uint256, bytes, uint256));
        emit RecipientPostCall(transactionFee, gasPrice, actualCharge, success, preRetVal);
    }

    function withdrawAllBalance() private returns (uint256) {
        uint256 balance = getRelayHub().balanceOf(address(this));
        getRelayHub().withdraw(balance);
        return balance;
    }
    
}
