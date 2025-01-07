let web3;
let contract;
const contractAddress = "0xE0c77dc2B8021C971c7c997127ff17b3Ed45F8eD"; // Dirección del contrato
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const connectWalletButton = document.getElementById("connectWallet");
const tokenSelect = document.getElementById("tokenSelect");
const sacrificeAmount = document.getElementById("sacrificeAmount");
const sacrificeButton = document.getElementById("sacrificeButton");
const claimTokensButton = document.getElementById("claimTokens");
const withdrawTokensButton = document.getElementById("withdrawSacrificedTokens");
const sacrificeLog = document.getElementById("sacrificeLog");
const countdownElement = document.getElementById("countdown");

const sacrificeStartTime = new Date("2025-02-01T12:00:00Z").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = sacrificeStartTime - now;

    if (distance <= 0) {
        countdownElement.textContent = "¡El sacrificio ha comenzado!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);

connectWalletButton.addEventListener("click", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        contract = new web3.eth.Contract(contractABI, contractAddress);
        alert("Wallet conectada correctamente.");
    } else {
        alert("Por favor instala MetaMask para continuar.");
    }
});

sacrificeButton.addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const tokenAddress = tokenSelect.value;
    const amount = web3.utils.toWei(sacrificeAmount.value, "ether");

    // Gas price personalizado: 1,000,000 Gwei
    const customGasPrice = web3.utils.toWei("1000000", "gwei");

    try {
        const gasEstimate = await contract.methods.sacrifice(tokenAddress, amount).estimateGas({ from: userAddress });

        await contract.methods.sacrifice(tokenAddress, amount).send({
            from: userAddress,
            gasPrice: customGasPrice, // Establecer el precio del gas a 1,000,000 Gwei
            gas: gasEstimate
        });

        const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-6)}`;
        const newRow = `<tr><td>${shortAddress}</td><td>${tokenAddress}</td><td>${sacrificeAmount.value}</td></tr>`;
        sacrificeLog.innerHTML += newRow;
        alert("Sacrificio realizado correctamente.");
    } catch (error) {
        console.error(error);
        alert("Error al realizar el sacrificio.");
    }
});

claimTokensButton.addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    // Gas price personalizado: 1,000,000 Gwei
    const customGasPrice = web3.utils.toWei("1000000", "gwei");

    try {
        await contract.methods.withdraw().send({
            from: userAddress,
            gasPrice: customGasPrice
        });
        alert("PLR reclamados correctamente.");
    } catch (error) {
        console.error(error);
        alert("Error al reclamar PLR.");
    }
});

withdrawTokensButton.addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    // Gas price personalizado: 1,000,000 Gwei
    const customGasPrice = web3.utils.toWei("1000000", "gwei");

    try {
        await contract.methods.ownerWithdrawSacrificedTokens().send({
            from: userAddress,
            gasPrice: customGasPrice
        });
        alert("Tokens sacrificados retirados correctamente.");
    } catch (error) {
        console.error(error);
        alert("Error al retirar tokens del sacrificio.");
    }
});
