const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
  beforeEach(async function () {
    const [deployer, administrator, user, dest] = await ethers.getSigners();
    this.deployer = deployer;
    this.administrator = administrator;
    this.user = user;
    this.dest = dest;

    const USDTContract = await ethers.getContractFactory("USDT");
    this.USDT = await USDTContract.connect(deployer).deploy();
    await this.USDT.deployed();

    const supply = 200;
    const price = "5000" + "000000000000000000";
    const name = "mbed";
    const symbol = "MBED";
    const NFTContract = await ethers.getContractFactory("NFT");
    this.NFT = await NFTContract.connect(administrator).deploy(name, symbol, supply, this.USDT.address, price);
    await this.NFT.deployed();
  });

  it("#mint", async function () {
    const uri = "www.google.com";
    const price = await this.NFT.price();
    await this.USDT.transfer(this.user.address, price);
    expect(await this.USDT.balanceOf(this.user.address)).to.equal(price);

    await this.USDT.connect(this.user).approve(this.NFT.address, price);
    await this.NFT.connect(this.user).mint(this.user.address, uri);
    expect(await this.USDT.balanceOf(this.user.address)).to.equal(0);
    expect(await this.NFT.balanceOf(this.user.address)).to.equal(1);
    expect(await this.NFT.tokenOfOwnerByIndex(this.user.address, 0)).to.equal(0);
    expect(await this.NFT.tokenURI(0)).to.equal(uri);

  });

  it("#withdraw", async function () {
    const uri = "www.google.com";
    const price = await this.NFT.price();
    await this.USDT.transfer(this.user.address, price);
    expect(await this.USDT.balanceOf(this.user.address)).to.equal(price);

    await this.USDT.connect(this.user).approve(this.NFT.address, price);
    await this.NFT.connect(this.user).mint(this.user.address, uri);
    expect(await this.USDT.balanceOf(this.dest.address)).to.equal(0);
    await this.NFT.connect(this.administrator).withdraw(this.dest.address);
    expect(await this.USDT.balanceOf(this.dest.address)).to.equal(await this.NFT.price());
  });
});
