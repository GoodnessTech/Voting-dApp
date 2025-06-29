// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract SimpleDAO {
    struct Proposal {
        string description;
        uint256 voteCount;
        mapping(address => bool) hasVoted;
    }

    Proposal[] public proposals;

    function createProposal(string memory _desc) public {
        Proposal storage newProposal = proposals.push();
        newProposal.description = _desc;
        newProposal.voteCount = 0;
    }

    function vote(uint256 proposalIndex) public {
        Proposal storage prop = proposals[proposalIndex];
        require(!prop.hasVoted[msg.sender], "You have already voted great one");
        prop.voteCount++;
        prop.hasVoted[msg.sender] = true;
    }

    function getProposal(
        uint256 index
    ) public view returns (string memory, uint256) {
        Proposal storage prop = proposals[index];
        return (prop.description, prop.voteCount);
    }

    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }
}
