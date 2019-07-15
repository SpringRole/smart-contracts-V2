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
    event RecipientPostCall(uint usedGas, bytes32 preRetVal);


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
        bytes memory, /*encodedFunction*/
        uint, /*gasPrice*/
        uint, /*transactionFee*/
        bytes memory, /*signature*/
        bytes memory /*approvalData*/
    ) 
        public view returns(uint) 
    {
        if (relaysWhitelist[relay]) {
            return 0;
        }
        
        if (from == blacklisted) {
            return 3;
        }

        if ( rejectAcceptRelayCall ) {
            return 12;
        } 

        return 0;
    }

    function preRelayedCall(
        address, /*relay*/
        address, /*from*/
        bytes memory, /*encodedFunction*/
        uint /*transactionFee*/
    )
        public returns (bytes32)
    {
        emit RecipientPreCall();
    }

    function postRelayedCall(
        address, /*relay*/
        address, /*from*/
        bytes memory, /*encodedFunction*/
        bool, /*success*/
        uint usedGas,
        uint transactionFee,
        bytes32 preRetVal
    ) 
        public
    {
        emit RecipientPostCall(usedGas * tx.gasprice * (transactionFee + 100)/100, preRetVal);
    }

    function withdrawAllBalance() private returns (uint256) {
        uint256 balance = getRelayHub().balanceOf(address(this));
        getRelayHub().withdraw(balance);
        return balance;
    }
    
}
