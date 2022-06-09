//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;

    Counters.Counter private _counter;

    uint256 public supply;
    uint256 public price;
    address public immutable paymentToken;
    mapping(uint256 => string) private _tokenURIs;

    event Withdraw(address user, uint256 amount);
    event Mint(address to, uint256 tokenId);

    constructor(string memory name_, string memory symbol_, uint256 supply_, address payment, uint256 price_) ERC721(name_, symbol_) {
        supply = supply_;
        price = price_;
        paymentToken = payment;
    }

    function mint(address _to, string memory uri) public returns(uint256 tokenId) {
        tokenId = _counter.current();
        require(tokenId < supply, "supply insufficient");

        uint256 allowance = IERC20(paymentToken).allowance(msg.sender, address(this));
        require(allowance >= price, "allowance insufficient");

        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), price);
        _safeMint(_to, tokenId);
        _counter.increment();
        _setTokenURI(tokenId, uri);
        emit Mint(_to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    function withdraw(address _to) public onlyOwner {
       uint256 amount = IERC20(paymentToken).balanceOf(address(this));
       IERC20(paymentToken).safeTransfer(_to, amount);
       emit Withdraw(_to, amount);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
}
