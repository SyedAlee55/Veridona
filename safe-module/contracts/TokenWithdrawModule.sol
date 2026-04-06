import "@safe-global/safe-contracts/contracts/common/Enum.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";

// SPDX-License-Identifier: LGPL-3.0
pragma solidity ^0.8.0;
// Imports will be added here

contract TokenWithdrawModule {
  // State variables will be added here
bytes32 public immutable PERMIT_TYPEHASH = //Used to construct the signature hash for the token transfer.

    keccak256(
      "TokenWithdrawModule(uint256 amount,address beneficiary,uint256 nonce,uint256 deadline)"
    );
address public immutable safeAddress; //Stores the Safe contract address.
address public immutable tokenAddress; // Stores the ERC20 token contract address.
mapping(address => uint256) public nonces; // Tracks unique nonce to prevent replay attacks.


  // Constructor will be added here
constructor(address _tokenAddress, address _safeAddress) {
    tokenAddress = _tokenAddress;
    safeAddress = _safeAddress;
}


///////// Functions will be added here. The use os as follows://///////

// EIP Function.

//   Explanation:

// Computes the EIP712Domain separator for the current chain and contract.
// Ensures compatibility with the EIP-712 standard for off-chain signing.
// Using a Domain separator ensures that the signature is valid for specific contracts in context and the chain. Thus, preventing replay attacks.

    function getDomainSeparator() private view returns (bytes32) {
      return keccak256(
          abi.encode(
              keccak256(
                  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
              ),
              keccak256(bytes("TokenWithdrawModule")),
              keccak256(bytes("1")),
              block.chainid,
              address(this)
            )
        );
    }

function tokenTransfer(
    uint amount,
    address receiver,
    uint256 deadline,
    bytes memory signatures
) public {
    require(deadline >= block.timestamp, "expired deadline");

    bytes32 signatureData = keccak256(
        abi.encode(
            PERMIT_TYPEHASH,
            amount,
            msg.sender,
            nonces[msg.sender]++,
            deadline
        )
    );

    bytes32 hash = keccak256(
        abi.encodePacked("\x19\x01", getDomainSeparator(), signatureData)
    );

    Safe(payable(safeAddress)).checkSignatures(
        hash,
        abi.encodePacked(signatureData),
        signatures
    );

    bytes memory data = abi.encodeWithSignature(
        "transfer(address,uint256)",
        receiver,
        amount
    );

    // Calling `execTransactionFromModule` with the transaction data to execute the token transfer through the Safe account.
    require(
        Safe(payable(safeAddress)).execTransactionFromModule(
            tokenAddress,
            0,
            data,
            Enum.Operation.Call
        ),
        "Could not execute token transfer"
    );
}

}
