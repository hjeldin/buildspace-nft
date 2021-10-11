pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
  string baseSvgCont = "' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

  string[] firstWords = ["Awewd","Krufad","Sastriid","Criajad","K'krord","Ugoid","Peckad","Tiiglaod","Houbd","Okid","Whold","Tuzd","Cehd","Oyeud","Nilod","Sriithuvd","Uthaad","Eeglofud","Atad","Idrud""Awewd","Krufad","Sastriid","Criajad","K'krord","Ugoid","Peckad","Tiiglaod","Houbd","Okid","Whold","Tuzd","Cehd","Oyeud","Nilod","Sriithuvd","Uthaad","Eeglofud","Atad","Idrud"];

  string[] secondWords = ["Oalaploed","Bupd","Diuglabd","Woeskiid","Eaghewd","Oiphiord","Theevod","Issegd","Droafud","Eauvaidd","Bicred","Stehahd","Glevud","Ossougleaud","Br'gd","Kurd","Oaquubraid","Ugibd","Phumocd","Eoniod"];

  string[] bkgColors = ['#3d5a80', '#293241', '#003f7d', '#2c5854', '#0d5b62'];

  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("CharNameNFT", "CHRN") {
    console.log("NFT Constructor called");
  }

  function random(string memory input) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(input)));
  }

  function getTotalNFTsMintedSoFar() view public returns (uint256) {
    return _tokenIds.current();
  }

  function makeAnEpicNFT() public {
    uint256 newItemId = _tokenIds.current();
    require(newItemId + 1 <= 49);
    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory combinedWord = string(abi.encodePacked(first, " ", second));
    string memory color = pickRandomColor(newItemId);
    string memory finalSvg = string(abi.encodePacked(baseSvg, color, baseSvgCont, combinedWord, "</text></svg>"));

    // Get all the JSON metadata in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // We set the title of our NFT as the generated word.
                    combinedWord,
                    '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");
    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, finalTokenUri);
    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("BKG_COL", Strings.toString(tokenId))));
    rand = rand % bkgColors.length;
    return bkgColors[rand];
  }
}