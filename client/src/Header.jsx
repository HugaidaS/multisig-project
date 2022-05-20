import React from "react";

const Header = ({
  approvers,
  quorum,
  balance,
  fillTheWallet,
  selectedAddress,
}) => {
  return (
    <header>
      <p>Quorum: {quorum}</p>
      <p>Approvers: {approvers.join(", ")}</p>
      <p>Wallet Balance: {balance} WEI</p>
      <p>Selected address: {selectedAddress}</p>
      <button onClick={() => fillTheWallet()}>Fill the wallet</button>
    </header>
  );
};
export default Header;
