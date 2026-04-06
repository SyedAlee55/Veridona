// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal interface for ERC20 transfer functionality.
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract DonationVault {
    // State variables
    address public immutable usdc;
    address public immutable safe;

    // Events for off-chain tracking
    event DonationReceived(address indexed donor, uint256 amount);

    /**
     * @param _usdc The address of the USDC token contract
     * @param _safe The address where donated funds will be stored
     */
    constructor(address _usdc, address _safe) {
        require(_usdc != address(0) && _safe != address(0), "Invalid addresses");
        usdc = _usdc;
        safe = _safe;
    }

    /**
     * @notice Moves 'amount' of USDC from sender to the safe.
     * @dev User must call usdc.approve(address(this), amount) before calling this.
     */
    function donate(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        // Execute transfer
        bool success = IERC20(usdc).transferFrom(msg.sender, safe, amount);
        
        // Ensure the transfer was successful
        require(success, "Transfer Failed!");

        emit DonationReceived(msg.sender, amount);
    }
}