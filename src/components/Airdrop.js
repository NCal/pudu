import React from 'react'
// import airKeys from '../../hidden/hidden'
// import Airtable from 'airtable'
import axios from 'axios'
import Countdown from 'react-countdown';

class Airdrop extends React.Component {
  constructor() {
    super()
    this.state = {
      address: null,
      success: false
    }
  }

  // getRecordsByAddress = () => {
  //   console.log('getRecordsByAddress')

  //   base('addresses')
  //     .select({
  //       // Selecting the first 3 records in Grid view:
  //       // maxRecords: 3,
  //       view: 'Grid view',
  //       // Change this to the address youre looking for
  //       filterByFormula: "{address} = 'THISISANADDRESS'"
  //     })
  //     .eachPage(
  //       function page(records, fetchNextPage) {
  //         // This function (`page`) will get called for each page of records.
  //         records.forEach(function (record) {
  //           console.log('Retrieved', record.get('address'))
  //         })

  //         // To fetch the next page of records, call `fetchNextPage`.
  //         // If there are more records, `page` will get called again.
  //         // If there are no more records, `done` will get called.
  //         fetchNextPage()
  //       },
  //       function done(err) {
  //         if (err) {
  //           console.error(err)
  //           return
  //         }
  //       }
  //     )
  // }

  handleClick = () => {
    // console.log('handleClick')
    if (
      this.state.address !== null &&
      this.state.address !== undefined &&
      this.state.address !== ''
    ) {
      // console.log('we have add', this.state.address)
      this.checkAddress(this.state.address)
    }
  }

  checkAddress = (address) => {
    let self = this
    const reg = /^0x[a-fA-F0-9]{40}$/
    console.log('check address', this.state.address)

    let test = reg.test(address)
    if (test) {
      // console.log('✅passed', address)
      //  send req here
      self.postRecord(address)
    }
  }

  postRecord = (address) => {
    let self = this;
    axios.post('/airtable', {address: address})
    .then((res)=> {
      // console.log('good',res)
      if (res.status === 200){
        self.setState({success: true},  ()=>{
          localStorage.setItem('signedUp', true)
        })
      }
    })
    .catch((err)=>{
      // console.log(err)
    })
  }

  handleInput = (e) => {
    this.setState({
      address: e.target.value,
    })
  }

  render(props) {
    if (this.state.success || window.top.localStorage.signedUp){
      return (
        <h3 className="airdropHeadingSuccess">
          THANKS FOR SIGNING UP
        </h3>
      )
    }

    let test = 1639343999000
    // to add a day add 86400000 to the number above
    return (
      <div className="main-content main-content-airdrop">
        <h3 className="airdropHeading">
        {/* <h3 className="airdropHeading " onClick={this.getRecordsByAddress}> */}
          AIRDROP
        </h3>
        <Countdown className="countdown" date={test} />
        {/* (12/12/21 @ 4:20 EST) */}
        <p className=" airdropps">Sign up for the Airdrop!</p>
        <p className=" airdropps">( Ends 12/12/21 4:20 EST )</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            className="addressInput"
            type="text"
            placeholder="FTM Address"
            onChange={this.handleInput}
          />
          <button className="button" onClick={this.handleClick}>
            Get The Airdrop
          </button>
        </form>
        <div className="block"></div>
      </div>
    )
  }
}

export default Airdrop
