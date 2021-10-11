import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react"
import {ethers} from 'ethers';
import MyEpicNFT from './utils/MyEpicNFT.json';
import { base64 } from 'ethers/lib/utils';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x6f1dfBef5f39b360587AE7e659A209d5779E6313";



const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(false);
  const [minted, setMinted] = useState("");
  const [mintedCount, setMintedCount] = useState("0");
  const [tokenId, setTokenId] = useState(null);
  const [tokenImage, setTokenImage] = useState(null);
  const [mintedImgUrl, setMintedImgUrl] = useState("");

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if(!ethereum){
      console.log("Could not find web3");
      return;
    } else {
      console.log("Web3 provider: ", ethereum);
    }
    const accounts = await ethereum.request({method:'eth_accounts'});
    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Account found:", account);
      setCurrentAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const checkCorrectNetwork = async () => {
    const {ethereum} = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();
    fetchMintedCount();
  }, []);

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum) {
        console.log("No Web3 provider");
        return;
      }
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.error(e);
    }
  }

  const fetchMintedCount = async() => {
    try {
      const {ethereum} = window;
      if(!ethereum){
        console.error("No Web3 provider");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, provider);
      let nftCount = (await connectedContract.getTotalNFTsMintedSoFar()).toString();
      setMintedCount(nftCount);

    } catch(e) {
      console.error(e);
    }
  }

  const fetchMetadata = async(token) => {
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, provider);
    let metadata = await connectedContract.tokenURI(token);
    console.log(metadata);
    let metadataJson = atob(metadata.split(',')[1]);
    console.log(metadataJson);
    let parsedJson = JSON.parse(metadataJson);
    console.log(parsedJson);
    setMintedImgUrl(parsedJson['image']);
  }

  const askContractToMintNFT = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum){
        console.error("No Web3 provider");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT.abi, signer);
      let nftTx = await connectedContract.makeAnEpicNFT();
      connectedContract.on("NewEpicNFTMinted", async (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        setMinted(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        setTokenId(tokenId.toNumber());
        await fetchMetadata(tokenId.toNumber());
      });
      console.log("Minting...");
      setMining(true);
      await nftTx.wait();
      console.log(`MINTED! Check: ${nftTx.hash}`);
      setMining(false);
    } catch(e) {
      console.error(e);
    }
  }

  const renderMiningAnimation = () => (
    <div className="sub-text">
      <img src='https://i.giphy.com/media/6fDQ3k4IOqnEA/giphy.webp' /><br />
      Hold on...
    </div>
  )

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button disabled={mining} onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintContainer = () => (
    <button disabled={mining} onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
    Mint NFT
    </button>
  )

  const renderMintedNFT = () => (
    <div>
      <h3 className="sub-text">Great job, you minted <a className="gradient-text border-gradient-green border-gradient" href={minted}>this NFT</a></h3>
      <img src={mintedImgUrl} style={{width: "50%"}}/>
    </div>
  )

  const renderUserControls = () => {
    if(minted != "") return renderMintedNFT();
    if(mining) return renderMiningAnimation();
    if(currentAccount === "") return renderNotConnectedContainer();
    else return renderMintContainer();
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Mint a D&D character name</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">{mintedCount}/{TOTAL_MINT_COUNT} minted so far.
          </p>
          {renderUserControls()}
        </div>
      </div>
    </div>
  );
};

export default App;
