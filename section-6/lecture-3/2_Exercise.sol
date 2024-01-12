// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/* Declare a custom error type which is called whenever the user tries to
   send ETH that is less than what's required
*/

// TODO: Create a custom error type called "InvalidAmount". Needed `minRequired` but sent `amount`
error InvalidAmount(uint256 sent, uint256 minRequired );


contract Exercise {
    mapping(address => uint) balances;
    uint minRequired;
    
    constructor (uint256 _minRequired) {
        minRequired = _minRequired;
    }
    
    function list() public payable {
        uint256 amount = msg.value;
       if(amount< minRequired){
        revert InvalidAmount({sent: amount, minRequired: minRequired});
       }
        balances[msg.sender] += amount;
    }
}