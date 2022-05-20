const { assert } = require("console");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const Wallet = artifacts.require("Wallet");

contract("Wallet", (accounts) => {
  let wallet;
  let admin = accounts[0];
  beforeEach(async () => {
    const approvers = [admin, accounts[1], accounts[2]];
    const quorum = 3;
    wallet = await Wallet.new(approvers, quorum);
    await web3.eth.sendTransaction({
      from: admin,
      to: wallet.address,
      value: 1000,
    });
  });

  it("Should have correct approvers and quorum", async () => {
    const approvers = await wallet.getApprovers.call();
    const quorum = await wallet.quorum.call();

    assert(approvers.length === 3);
    assert(approvers[0] === admin);
    assert(approvers[1] === accounts[1]);
    assert(approvers[2] === accounts[2]);
    assert(quorum.toString() === "3");
  });

  it("Should create a new transfer", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    const transfers = await wallet.getTransfers.call();
    assert(transfers.length === 1);
    assert(transfers[0].id === "0");
    assert(transfers[0].amount === "100");
    assert(transfers[0].to === accounts[5]);
  });

  it("Should increment approvals", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    await wallet.approveTransfer(0, { from: admin });
    const transfers = await wallet.getTransfers.call();
    const balance = await web3.eth.getBalance(wallet.address);
    assert(transfers[0].approvals === "1");
    assert(transfers[0].sent === false);
    assert(balance.toString() === "1000");
  });

  it("Should transfer if the quorum is reached", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(accounts[5])
    );
    await wallet.approveTransfer(0, { from: admin });
    await wallet.approveTransfer(0, { from: accounts[1] });
    await wallet.approveTransfer(0, { from: accounts[2] });
    const balanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(accounts[5])
    );
    assert(balanceAfter.sub(balanceBefore).toString() === "100");
  });

  it("Should NOT create transfers if sender is not allowed", async () => {
    let action = wallet.createTransfer(100, accounts[5], {
      from: accounts[4],
    });
    await expectRevert(action, "only approver allowed");
  });

  it("Should NOT approve transfer if sender is not allowed", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    const action = wallet.approveTransfer(0, { from: accounts[5] });
    await expectRevert(action, "only approver allowed");
  });

  it("Should NOT approve transfer if transfer is already sent", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    await wallet.approveTransfer(0, { from: admin });
    await wallet.approveTransfer(0, { from: accounts[1] });
    await wallet.approveTransfer(0, { from: accounts[2] });
    const action = wallet.approveTransfer(0, { from: accounts[2] });
    await expectRevert(action, "transfer has already been sent");
  });

  it("Should NOT approve twice", async () => {
    await wallet.createTransfer(100, accounts[5], { from: admin });
    await wallet.approveTransfer(0, { from: accounts[1] });
    const action = wallet.approveTransfer(0, { from: accounts[1] });
    await expectRevert(action, "cannot approve transfer twice");
  });
});
