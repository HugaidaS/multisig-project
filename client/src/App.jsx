import { useEffect, useState } from "react";
import { getWallet, getWeb3 } from "./utils";
import Header from "./Header";
import NewTransfer from "./NewTransfer";
import TransferList from "./TransferList";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [approvers, setApprovers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [quorum, setQuorum] = useState(undefined);
  const [balance, setBalance] = useState("");
  const [selectedAddress, setSelectedAddres] = useState(
    window.ethereum.selectedAddress
  );

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const wallet = await getWallet(web3);
      const accounts = await web3.eth.getAccounts();
      const approvers = await wallet.methods.getApprovers().call();
      const quorum = await wallet.methods.quorum().call();
      const transfers = await wallet.methods.getTransfers().call();
      const balance = await web3.eth.getBalance(wallet._address);
      setWeb3(web3);
      setWallet(wallet);
      setAccounts(accounts);
      setApprovers(approvers);
      setQuorum(quorum);
      setTransfers(transfers);
      setBalance(balance);
    };
    init();

    const listenMMAccount = async () => {
      window.ethereum.on("accountsChanged", async function () {
        setSelectedAddres(window.ethereum.selectedAddress);
      });
    };
    listenMMAccount();
  }, [balance]);

  const fillTheWallet = async () => {
    const balanceOfSelectedAddress = await web3.eth.getBalance(selectedAddress);
    if (balanceOfSelectedAddress.toString() === "0") {
      alert("Your secelted address has no ethers to add to the Wallet");
    } else {
      await web3.eth.sendTransaction({
        from: selectedAddress,
        to: wallet._address,
        value: 1000000000000000000,
      });
      const balance = await web3.eth.getBalance(wallet._address);
      const balanceInEthers = balance.toString();
      setBalance(balanceInEthers);
    }
  };
  const createTransfer = async (transfer) => {
    if (!transfer.amount || !transfer.to) {
      alert("Not enought data to create transfer");
    }
    await wallet.methods
      .createTransfer(transfer.amount, transfer.to)
      .send({ from: selectedAddress });
    const transfers = await wallet.methods.getTransfers().call();
    setTransfers(transfers);
  };
  const approveTransfer = async (transferId) => {
    if (!transferId) {
      alert("Transfer Id is not indentified!");
    }
    await wallet.methods
      .approveTransfer(transferId)
      .send({ from: selectedAddress });
    const transfers = await wallet.methods.getTransfers().call();
    const newBalance = await web3.eth.getBalance(wallet._address);
    if (newBalance !== balance) {
      setBalance(newBalance);
    }
    setTransfers(transfers);
  };
  const getApprovals = async (transferId) => {
    return await wallet.methods.approvals(selectedAddress, transferId).call();
  };

  if (
    typeof web3 === "undefined" ||
    typeof accounts === "undefined" ||
    typeof wallet === "undefined" ||
    approvers.length === 0
  ) {
    return <div>Loading ...</div>;
  }
  return (
    <div className="App">
      <Header
        quorum={quorum}
        approvers={approvers}
        balance={balance}
        fillTheWallet={fillTheWallet}
        selectedAddress={selectedAddress}
      />
      <NewTransfer
        createTransfer={createTransfer}
        selectedAddress={selectedAddress}
        approvers={approvers}
      />
      <TransferList
        transfers={transfers}
        approveTransfer={approveTransfer}
        getApprovals={getApprovals}
        selectedAddress={selectedAddress}
      />
    </div>
  );
}

export default App;
