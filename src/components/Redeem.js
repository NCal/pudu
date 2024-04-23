import React from 'react'
import { ethers } from 'ethers'
import Countdown from 'react-countdown'
import BigNumber from 'bignumber.js'
import devTokenAbi from '../assets/devToken.json'
import StakingRewardsObj from '../assets/StakingRewards.json'
import StakingTokenObj from '../assets/StakingTokenabi.json'
import RewardsTokenObj from '../assets/RewardsTokenabi.json'
import ReserveTokenObj from '../assets/Reserve.json'

let StakingRewardsABI = StakingRewardsObj['abi']
let StakingTokenABI = StakingTokenObj['abi']
let RewardsTokenABI = RewardsTokenObj['abi']
let ReserveTokenABI = ReserveTokenObj['abi']

console.log('StakingTokenAsBI', StakingTokenABI)
console.log('StakingRewardsABI', StakingRewardsABI)
console.log('devTokenAbi', devTokenAbi)

class Redeem extends React.Component {
  constructor() {
    super();
    this.state = {
      address: null,
      success: false,
      amount: undefined,
      balance: null,
      rewBalance: null,
      staked: null,
      totalStaked: null,
      totalStakedSupply: null,
      provider: new ethers.providers.Web3Provider(window.ethereum),
      claimable: null,
      stakingTokencontract: null,
      rewContract: null,
      resContract: null,
      srContract: null,
      approvedAmount: null,
      approvedgPudu: null,
      earned: null,
      errormsg: null,
    };
  }

  componentDidMount = async () => {
    let self = this;
    // STK:
    let stakeAddress = "0x7cf45E47f11e2193f2147Ce3d76669CaB4c07687";

    // RWRD:
    let rewardTokenContract = "0x05F00858FE0cAe07bC658a57057f576313B9CD24";

    // STAKING REWARDS CONTRACT:
    let StakingRewardsContract = "0xe5dC662e9eC3d7162Ef4D018A154901feEC0379f";

    // RESERVE CONTRACT:
    let reserveContract = "0xBFd2B2aE919Bf5fd2BD7Faf5394Da2d67C9419C5";

    const provider = self.state.provider;
    const signer = provider.getSigner();

    const stakingTokencontract = new ethers.Contract(
      stakeAddress,
      StakingTokenABI,
      signer
    );

    const srContract = new ethers.Contract(
      StakingRewardsContract,
      StakingRewardsABI,
      signer
    );

    const rewContract = new ethers.Contract(
      rewardTokenContract,
      RewardsTokenABI,
      signer
    );

    const resContract = new ethers.Contract(
      reserveContract,
      ReserveTokenABI,
      signer
    );

    self.setState(
      {
        stakingTokencontract: stakingTokencontract,
        srContract: srContract,
        rewContract: rewContract,
        resContract: resContract,
      },
      () => {
        // ADD LISTENERS HERE
        console.log("self.state.resContract", self.state.resContract);

        window.top.ethereum.on("accountsChanged", (accounts) => {
          console.log("accounts changed");
          // If user has locked/logout from MetaMask, this resets the accounts array to empty
          if (!accounts.length) {
            // logic to handle what happens once MetaMask is locked
            self.setState({
              address: null,
              success: false,
              amount: undefined,
              balance: null,
              stakes: null,
              totalStaked: null,
              earned: null,
              approvedAmount: null,
              approvedgPudu: null
            });
          }
        });

        stakingTokencontract.on("Transfer", (owner, spender, amount) => {
          console.log(
            "TRANSFER EVENT: from Staking token contract",
            owner,
            spender,
            ethers.utils.formatEther(amount)
          );
          self.setBalance();
          self.getStaked();
          self.getTotalStaked();
          self.getEarned();
        });

        rewContract.on("Approval", (owner, spender, amount) => {
          console.log(
            "Approval EVENT: from rewContract",
            owner,
            spender,
            ethers.utils.formatEther(amount)
          );
          self.setBalance();
          self.getStaked();
          self.getTotalStaked();
          self.getRewAllowance();
          self.setRewBalance();
          self.getEarned();
        });

        rewContract.on("Transfer", (owner, spender, amount) => {
          console.log(
            "TRANSFER EVENT: from rewContract",
            owner,
            spender,
            ethers.utils.formatEther(amount)
          );
          self.setBalance();
          self.getStaked();
          self.getTotalStaked();
          self.getRewAllowance();
          self.setRewBalance();
          self.getEarned();
        });

        self.checkLoggedIn();
      }
    );
  };

  checkLoggedIn = async () => {
    console.log("check logged in");

    let self = this;
    let provider = self.state.provider;
    self.setState({ provider: provider });
    const signer = provider.getSigner();
    console.log("signer", signer);

    let loggedIn = await signer
      .getAddress()
      .then((res) => {
        console.log("res", res);
        return true;
      })
      .catch((err) => {
        console.log("uh oh, checkLoggedIn err", err);
        // NO ADDRESS WE SHOULD NOT TRY TO SIGN MM IN
        return false;
      });

    if (loggedIn) {
      console.log("we should do stuff");
      self.connectWallet();
    } else {
      console.log("Not Logged In: dont do anything");
      return;
    }
  };

  connectWallet = async () => {
    let self = this;
    if (this.state.address) {
      console.log("we have an address", this.state.address);
      console.log("self.state.provider", self.state.provider);
      return;
    }
    console.log("connect wallet");

    let provider = self.state.provider;
    const signer = provider.getSigner();

    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...

    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);

    await signer
      .getAddress()
      .then((res) => {
        console.log("res", res);
        self.setState({ address: res }, () => {
          self.setBalance();
          self.getRewAllowance();
          self.getEarned();
          self.getTotalStaked();
          self.setRewBalance();
        });
        console.log("address", res);
      })
      .catch((err) => {
        console.log("uh oh, err @ signer.getAddress", err);
      });
  };

  approveReward = () => {
    console.log("approveReward");

    let self = this;
    let rewardTokenContract = "0x05F00858FE0cAe07bC658a57057f576313B9CD24";
    let reserveContract = "0xBFd2B2aE919Bf5fd2BD7Faf5394Da2d67C9419C5";

    self.clearError();

    let amount = ethers.utils.parseUnits(
      new BigNumber(self.state.rewBalance).toFixed(),
      18
    );

    if (BigNumber(self.state.earned).toFixed() > 0) {
      console.log('earned', BigNumber(self.state.earned).toFixed());
      console.log('amount', BigNumber(amount).toFixed());
      //approve the stakingrewardscontract to spend the STK token
      // self.state.resContract.estimateGas
      //   .approve(reserveContract, amount)
      //   .then((gas) => {
      // console.log('gas', gas.toString())
      self.state.rewContract
        .approve(reserveContract, amount)
        .then((res) => {
          console.log("approve", res);
        })
        .catch((err) => {
          console.log("uh oh, error approveReward", err);
        });
      // })
    } else {
      console.log("Balance = 0. Nothing to Approve.");
      self.setState({ errormsg: "Balance = 0. Nothing to Approve." });
    }
  };

  getEarned = () => {
    console.log("get earned");

    let self = this;
    let gas;
    self.clearError();

    self.state.srContract
      .earned(self.state.address)
      .then((res) => {
        console.log("earned", ethers.utils.formatEther(res));
        self.setState({ earned: ethers.utils.formatEther(res) });
      })
      .catch((err) => {
        console.log("uh oh: getEarned", err);
        self.setState({ errormsg: err.data.message });
      });
  };

  getTotalStaked = () => {
    console.log("getTotalStaked");

    let self = this;
    self.clearError();

    self.state.srContract
      .getTotalSupply()
      .then((res) => {
        console.log("TotalStaked", ethers.utils.formatEther(res));
        self.setState({ totalStakedSupply: ethers.utils.formatEther(res) });
      })
      .catch((err) => {
        console.log("uh oh: getTotalStaked", err);
        self.setState({ errormsg: err.data.message });
      });
  };

  getRewAllowance = () => {
    console.log("get Rew allowance");

    let self = this;
    let reserveContract = "0xBFd2B2aE919Bf5fd2BD7Faf5394Da2d67C9419C5";

    self.clearError();

    self.state.rewContract
      .allowance(self.state.address, reserveContract)
      .then((res) => {
        console.log("rew allowance", ethers.utils.formatEther(res));
        self.setState({ approvedgPudu: ethers.utils.formatEther(res) });
      })
      .catch((err) => {
        console.log("uh oh: getAllowance", err);
        self.setState({ errormsg: err.data.message });
      });
  };

  contractMethod = (contract, method, estimateGas) => {
    console.log("contractMethod");
    // takes a contract, a method name, and a bool called estimateGas

    let call;
    estimateGas
      ? (call = contract.estimateGas[method])
      : (call = contract[method]);
    console.log("estimateGas", estimateGas, "method", method, "call", call);

    if (estimateGas) {
      contract.estimateGas[method]().then((gas) => {
        console.log("GAS", gas.toString());
        contract[method]({ gasLimit: gas.toString() })
          .then((res) => {
            console.log(method, "res", res);
          })
          .catch((err) => {
            console.log("err", err);
            // dont show error if user rejects the transaction
            if (
              err.data.message.indexOf("User denied transaction signature") !==
              -1
            ) {
              return;
            }
            self.setState({ errormsg: err.data.message });
          });
      });
      return;
    }

    contract[method]()
      .then((res) => {
        console.log(method, "res", res);
      })
      .catch((err) => {
        console.log("err", err);
        // dont show error if user rejects the transaction
        if (
          err.data.message.indexOf("User denied transaction signature") !== -1
        ) {
          return;
        }
        self.setState({ errormsg: err.data.message });
      });
  };

  claimReward = () => {
    console.log("claim Reward");

    let self = this;
    self.clearError();

    if (self.state.earned <= 0) {
      console.log("self.state.claimable ", self.state.earned);
      self.setState({ errormsg: "gPudu Balance Must Be More Than 0.0" });
      return;
    }

    self.state.srContract.estimateGas.getReward().then((gas) => {
      console.log("GAS", gas.toString());
      self.state.srContract
        .getReward({ gasLimit: gas.toString() })
        .then((res) => {
          console.log("claim", res);
        })
        .catch((err) => {
          console.log("err", err);
          // dont show error if user rejects the transaction
          if (
            err.data.message.indexOf("User denied transaction signature") !== -1
          ) {
            return;
          }
          self.setState({ errormsg: err.data.message });
        });
    });
  };

  handleClick = () => {
    console.log("handleClick");
    if (
      this.state.address !== null &&
      this.state.address !== undefined &&
      this.state.address !== ""
    ) {
      this.checkAddress(this.state.address);
    }
  };

  checkAddress = (address) => {
    let self = this;
    const reg = /^0x[a-fA-F0-9]{40}$/;
    console.log("check address", this.state.address);

    let test = reg.test(address);
    if (test) {
      console.log("✅passed", address);
      //  send req here
    }
  };

  setBalance = async () => {
    console.log("setBalance");
    let self = this;
    self.clearError();

    await self.state.stakingTokencontract
      .balanceOf(self.state.address)
      .then((res) => {
        self.setState({ balance: ethers.utils.formatEther(res) });
        let string = res.toString();
        console.log("string", string);
      })
      .catch((err) => {
        console.log("uh oh: setBalance", err);
        self.setState({ errormsg: err.data.message });
      });
  };

  setRewBalance = async () => {
    console.log("setRewBalance");
    let self = this;
    self.clearError();
    await self.state.rewContract
      .balanceOf(self.state.address)
      .then((res) => {
        console.log("rew balance", ethers.utils.formatEther(res));
        self.setState({ rewBalance: ethers.utils.formatEther(res) });
      })
      .catch((err) => {
        console.log("uh oh: setRewBalance", err);
        self.setState({ errormsg: err.data.message });
      });
  };

  handleInput = (e) => {
    let self = this;
    console.log(e.target.value);
    self.setState({ amount: Number(e.target.value) });
  };

  clearError = () => {
    let self = this;
    console.log("clear error");
    self.setState({ errormsg: null });
  };

  pullAmount = async (e) => {
    let self = this;
    let pullAmount = new BigNumber(e.target.innerText).toFixed();
    console.log("pullAmount", pullAmount);
    self.setState({ amount: pullAmount });
  };

  redeem = async () => {
    console.log("Redeem");
    let self = this;

    let reserveContract = "0xBFd2B2aE919Bf5fd2BD7Faf5394Da2d67C9419C5";
    const provider = self.state.provider;
    const signer = provider.getSigner();
    const resContract = new ethers.Contract(
      reserveContract,
      ReserveTokenABI,
      signer
    );

    self.clearError();
    let numAmount = new BigNumber(self.state.amount).toFixed();
    let numBalance = new BigNumber(self.state.rewBalance).toFixed();

    console.log("numAmount", numAmount, "rew balance", numBalance);

    if (
      numAmount === null ||
      numAmount === undefined ||
      numAmount === NaN ||
      numAmount === "NaN"
    ) {
      console.log("Please Enter An Amount");
      self.setState({ errormsg: "Please Enter An Amount" });
      return;
    }

    if (!numAmount || numAmount == 0) {
      self.setState({ errormsg: "Please Enter An Amount Greater Than Zero." });
      return;
    }

    if (Number(numAmount) > Number(numBalance)) {
      console.log("numAmount", numAmount, "numStaked", numBalance);
      self.setState({ errormsg: "Cannot Redeem More Than Your balance." });
      return;
    }

    let amount = ethers.utils.parseUnits(numAmount, 18);
    // .toString()

    console.log("amount", amount, resContract);
    // resContract.estimateGas.redeem(amount).then((gas) => {
    // console.log('GAS', gas.toString())
    // resContract["redeem(uint _amount)"](amount)
    resContract
      .redeem(amount)
      .then((res) => {
        console.log("redeem", res);
      })
      .catch((err) => {
        console.log("uh oh, redeem:", err);

        if (err.message.indexOf("out-of-bounds") !== -1) {
          self.setState({ errormsg: "Out Of Bounds. Try A Positive Number." });
          return;
        }
        self.setState({ errormsg: err.data.message });
      });
    // })
  };

  render(props) {
    let self = this;
    let stakes = "";
    let showStakes;
    let userInfo;

    let test = 1639343999000;
    1602767476;

    let loader = (
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );

    if (self.state.address) {
      userInfo = (
        <div className="user-info2">
          <p>💰️ Redeemer Info</p>
          <div className="scroller">
            <ul>
              <li className={"info-li"}>
                Address:{" "}
                <span className="amount-staked">
                  ...
                  {this.state.address
                    .split("")
                    .slice(30, this.state.address.split("").length)}
                </span>
              </li>
              <li className={"info-li"}>
                PUDU Balance:{" "}
                <span className="info-number green" onClick={self.pullAmount}>
                  {this.state.balance}
                </span>
              </li>
              {/* <li className={"info-li"}>
                gPUDU Balance:{" "}
                <span className="info-number purple" onClick={self.pullAmount}>
                  {this.state.rewBalance}
                </span>
              </li> */}

              {/* <li className={"info-li"}>
                gPUDU Approved To Redeem:{" "}
                <span className="info-number purple" onClick={self.pullAmount}>
                  {this.state.approvedgPudu}
                </span>
              </li> */}
              {/* <li className={"info-li"}>
                Staked Balance:{" "}
                <span className="info-number" onClick={self.pullAmount}>
                  {this.state.totalStaked}
                </span>
              </li> */}
              <li className={"info-li"} onClick={self.claimReward}>
                gPUDU Accrued:{" "}
                <span className="info-number purple">
                  {this.state.earned}{" "}
                  {Number(this.state.earned) > 0 ? "⚡️" : ""}
                </span>
              </li>
            </ul>
          </div>
        </div>
      );
    } else {
      userInfo = null;
    }

    // to add a day add 86400000 to the number above
    return (
      <div className="main-content main-content-stake">
        {/* {loader} */}
        <div className="tvl">TVL: {self.state.totalStakedSupply} p</div>
        <div className="directions">
          <p>Step 1. Connect Metamask Wallet.</p>
          <p>
            Step 2. Enter An Amount Of gPUDU To Approve, Click Approve gPUDU.
          </p>
          {/* <p>
            Step 3. Once Approved, Enter An Amount & Click{" "}
            <span className="green">Redeem!</span>
          </p> */}
        </div>
        {/* <button onClick={this.getEarned}>earned</button>
        <button onClick={this.getRewAllowance}>RewAllowance</button>

        <button onClick={this.claimReward}>claimReward</button>
        <button onClick={this.approveReward}>Approve gPudu</button>
        <button onClick={this.redeem}>Redeem gPudu</button> */}
        {/* <button onClick={()=>{this.contractMethod(self.state.srContract, 'getReward', true)}}>contractMethod</button> */}

        <div className="info">{userInfo}</div>
        {this.state.address ? (
          <div className="connect-button" onClick={this.connectWallet}>
            {this.state.address}
            <span
              className="connected"
              style={{ backgroundColor: "rgb(68, 255, 47)" }}
            ></span>
          </div>
        ) : (
          <div className="connect-button" onClick={this.connectWallet}>
            Connect Wallet
            <span
              className="connected"
              style={{ backgroundColor: "red" }}
            ></span>
          </div>
        )}

        <h3 className="stakeHeading">REDEEM</h3>
        <p className=" stakeps">Redeem Your gPUDU For PUDU</p>
        <React.Fragment>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="stake-box">
              <input
                className="stakeInput"
                placeholder="0.0"
                onChange={this.handleInput}
                min="0"
                value={this.state.amount || ""}
                step="any"
                type={"number"}
              />

              <button
                className="button stake-button"
                onClick={this.approveReward}
              >
                Approve gPUDU
              </button>
              <button
                className="button stake-button green"
                onClick={this.redeem}
              >
                Redeem!
              </button>
              {/* <button
                className="button stake-button"
                onClick={this.handleWithdraw}
              >
                Withdraw Stake
              </button> */}
            </div>
          </form>

          <p className="errormsg errormsg-disabled">{self.state.errormsg}</p>
        </React.Fragment>
        <div className="block"></div>
      </div>
    );
  }
}

export default Redeem
