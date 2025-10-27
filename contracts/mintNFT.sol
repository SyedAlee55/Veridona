// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract createNFT is ERC721 {
    uint256 private _tokenIDs; //counter

    // event name(name of the donor, which nft they got, what amount they donated)
    event DonationReceived(address indexed donor, uint256 indexed tokenID, uint256 amount);

        constructor () ERC721 ("VeridonaReceipt", "VDON") {}

        function mint() external payable {
            require (msg.value > 0, "Send some ETH");
            _tokenIDs++;
            uint256 newTokenID = _tokenIDs;
            _safeMint(msg.sender, newTokenID);
            emit DonationReceived(msg.sender, newTokenID, msg.value);
        }
}