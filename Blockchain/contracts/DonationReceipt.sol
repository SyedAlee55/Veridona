// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationReceipt is ERC721, Ownable {
    uint256 private _nextTokenId;
    address public donationModule;

    // Mapping to ensure 1 NFT per donor (First-time only)
    mapping(address => bool) public hasReceipt;

    event ReceiptMinted(address indexed donor, uint256 tokenId);

    constructor() ERC721("Veridona Receipt", "VDR") Ownable(msg.sender) {}

    // Only the DonationModule can call this when a donation happens
    modifier onlyModule() {
        require(msg.sender == donationModule, "Only the Donation Module can mint");
        _;
    }

    function setModuleAddress(address _module) external onlyOwner {
        donationModule = _module;
    }

    /**
     * @dev Mints a unique receipt to the donor.
     * Logic: Called by DonationModule during the first donation.
     */
    function mintReceipt(address _donor) external onlyModule returns (uint256) {
        require(!hasReceipt[_donor], "User already has a receipt");
        
        uint256 tokenId = _nextTokenId++;
        hasReceipt[_donor] = true;
        _safeMint(_donor, tokenId);
        
        emit ReceiptMinted(_donor, tokenId);
        return tokenId;
    }

    /**
     * @dev SOULBOUND LOGIC: Overriding the transfer functions 
     * to prevent the NFT from leaving the donor's wallet.
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override 
        returns (address) 
    {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)), but block all other transfers
        if (from != address(0) && to != address(0)) {
            revert("Veridona Receipts are Soulbound and non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // Optional: Return a URL for the NFT image/metadata
    function _baseURI() internal pure override returns (string memory) {
        return "https://api.veridona.com/metadata/";
    }
}