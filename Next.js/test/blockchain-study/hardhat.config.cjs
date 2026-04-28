require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",

  // 로컬 Hardhat 노드 네트워크 설정
  // npx hardhat node 명령어로 이 네트워크가 실행됩니다
  networks: {
    hardhat: {
      chainId: 31337, // MetaMask에 등록할 때 필요한 체인 ID
    },
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat 로컬 노드 주소
      chainId: 31337,
    },
  },
};
