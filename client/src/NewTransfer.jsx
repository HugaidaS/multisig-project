import React, { useRef, useState, useEffect } from "react";

const NewTransfer = ({ createTransfer, selectedAddress, approvers }) => {
  const [approversList, setApproversList] = useState([]);
  useEffect(() => {
    const lowercaseApprovers = approvers.map((approver) =>
      approver.toLowerCase()
    );
    setApproversList(lowercaseApprovers);
  }, [selectedAddress, approvers]);

  const [transfer, setTransfer] = useState(undefined);
  const amountInput = useRef();
  const addressInput = useRef();

  const updateTransfer = (e) => {
    const value = e.target.value;
    const field = e.target.id;
    setTransfer((prev) => {
      return { ...prev, [field]: value };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    console.log(transfer);
    await createTransfer(transfer);
    amountInput.current.value = "";
    addressInput.current.value = "";
  };

  return approversList.includes(selectedAddress) ? (
    <div>
      <h2>Create New Transfer</h2>
      <form onSubmit={(e) => submit(e)}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="text"
          onChange={(e) => updateTransfer(e)}
          ref={amountInput}
        />
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="text"
          onChange={(e) => updateTransfer(e)}
          ref={addressInput}
        />
        <button>Submit</button>
      </form>
    </div>
  ) : (
    "You have to be in the list of approvers to create a new transfer"
  );
};

export default NewTransfer;
