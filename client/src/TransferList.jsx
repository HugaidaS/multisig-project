import React, { useEffect, useState } from "react";

const TransferList = ({
  transfers,
  approveTransfer,
  getApprovals,
  selectedAddress,
}) => {
  const [approvals, setApprovals] = useState([]);
  useEffect(() => {
    const fetchApprovals = async () => {
      let approvalsPromises = transfers.map(
        async (transfer) => await getApprovals(transfer.id)
      );
      Promise.all(approvalsPromises).then((values) => {
        console.log(values);
        setApprovals(values);
      });
    };
    fetchApprovals();
  }, [transfers, getApprovals, selectedAddress]);

  return transfers.length > 0 ? (
    <div>
      <h2>List of transfers</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Amount</th>
            <th>To</th>
            <th>Approvals</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, idx) => (
            <tr key={transfer.id}>
              <td>{transfer.id}</td>
              <td>{transfer.amount}</td>
              <td>{transfer.to}</td>
              <td>{transfer.approvals}</td>
              <td>{transfer.sent ? "yes" : "no"}</td>

              <td>
                {approvals[idx] ? (
                  "Approved"
                ) : transfer.sent ? (
                  "Transfer was sent"
                ) : (
                  <button
                    onClick={() => {
                      console.log(transfer.id);
                      return approveTransfer(transfer.id);
                    }}
                  >
                    Approve Transfer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    "No transfers to show for now"
  );
};

export default TransferList;
