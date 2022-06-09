const hre = require("hardhat");

async function main() {
  const provider = ethers.provider
  const administrator = (await ethers.getSigners())[0]
  const balance = await provider.getBalance(administrator.address)
  console.log(administrator.address, balance.toString())

  
  const NFTContract = await ethers.getContractFactory("NFT")
  const price = "0" //"5000" + "000000000000000000"
  const USDT = "0x55d398326f99059ff775485246999027b3197955"
  const supply = 200
  const name = "mbed"
  const symbol = "MBED"
  const nft = await NFTContract.connect(administrator).deploy(name, symbol, supply, USDT, price)
  await nft.deployed()
  console.log("contract deploy on:", nft.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
