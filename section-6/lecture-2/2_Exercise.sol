// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
   Declare an event and emit it in the given function
*/
contract Exercise {
   // TODO: Create an event called "Deposit" that logs the sender and the amount of ETH sent
   event Deposit(address indexed _from, uint _value);

   function deposit() public payable {    
      // TODO: Emit the "Deposit" event here 
      emit Deposit(msg.sender, msg.value);
   }
}
