// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleBank {

    // receive eth
    receive () external payable {} //Open-door

    function getBalance () public view returns (uint256) { //Window
        return address(this).balance;
    } 

    function withdraw () external { // Out-door
        payable(msg.sender).transfer(address(this).balance);
    }
}