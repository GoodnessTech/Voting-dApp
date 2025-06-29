const contractAddress = "0x2e64859Fa2bb9Cfc64846d7087375590719998Bc"; // replace with your deployed contract address

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_desc",
				"type": "string"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalIndex",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getProposal",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
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
		"inputs": [],
		"name": "getProposalCount",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
let provider;
let signer;
let contract;
let allProposalCount = 0;
let visibleProposals = 5;

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask to use this dApp");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.ready;
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    const address = await signer.getAddress();
    document.getElementById("walletDisplay").innerText = "Connected: " + address.slice(0, 6) + "..." + address.slice(-4);

    loadProposals();
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
}

async function createProposal() {
  const input = document.getElementById("proposalInput").value.trim();
  if (!input) return alert("Proposal cannot be empty");

  try {
    const tx = await contract.createProposal(input);
    await tx.wait();
    alert("Proposal created!");
    document.getElementById("proposalInput").value = "";
    loadProposals();
  } catch (err) {
    console.error("Error creating proposal:", err);
    alert("Failed to create proposal");
  }
}

async function vote(index) {
  try {
    const tx = await contract.vote(index);
    await tx.wait();
    alert("Vote cast!");
    loadProposals();
  } catch (err) {
    console.error("Voting error:", err);
    alert("You may have already voted on this proposal.");
  }
}

async function loadProposals() {
  if (!contract) return;

  try {
    allProposalCount = await contract.getProposalCount();
    const displayLimit = Math.min(visibleProposals, allProposalCount);
    const container = document.getElementById("proposalsContainer");
    container.innerHTML = "";

    for (let i = 0; i < displayLimit; i++) {
      const [desc, votes] = await contract.getProposal(i);

      const div = document.createElement("div");
      div.className = "proposal-card";
      div.innerHTML = `
        <p><strong>${desc}</strong></p>
        <p>Votes: ${votes}</p>
        <button onclick="vote(${i})">Vote</button>
      `;
      container.appendChild(div);
    }

    document.getElementById("readMoreBtn").style.display = allProposalCount > visibleProposals ? "block" : "none";
  } catch (err) {
    console.error("Loading proposals failed:", err);
  }
}

function showAllProposals() {
  visibleProposals = allProposalCount;
  loadProposals();
}
