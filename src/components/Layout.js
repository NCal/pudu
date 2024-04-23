import React from 'react'
import {Link, BrowserRouter, Route, Switch} from 'react-router-dom'

import About from './About'
import Tokenomics from './Tokenomics'
import Airdrop from './Airdrop'
import NotFound from './NotFound'
import Stake from './Stake'
import Redeem from "./Redeem";
const Layout = (props) => {
  return (
    <BrowserRouter>
      <div className="container">
        <div className="left">
          <header>
            <ul className="main-nav">
              <Link className={"icon"} to="/">
                <li></li>
              </Link>
              <li className={"navTitle"}>
                <Link to="/">PUDU</Link>
              </li>
              <li>
                <Link className={"navLink"} to="/about">
                  About
                </Link>
              </li>
              {/* <li>
                <Link className={"navLink"} to="/tokenomics">
                  Tokenomics
                </Link>
              </li> */}
              {/* <li><Link className={'navLink'} to="/airdrop">Airdrop</Link></li> */}
              <li>
                <Link className={"navLink"} to="/stake">
                  Stake
                </Link>
              </li>
              {/* <li>
                <Link className={"navLink"} to="/redeem">
                  Redeem
                </Link>
              </li> */}
            </ul>
          </header>
          <div className="mobile-header">
            <ul className="mobile-nav">
              <Link className={"icon"} to="/">
                <li></li>
              </Link>
              {/* <li>
                <Link className={""} to="/about">
                  About
                </Link>
              </li> */}
              {/* <li>
                <Link className={""} to="/tokenomics">
                  Tokenomics
                </Link>
              </li> */}
              {/* <li><Link className={'navLink'} to="/airdrop">Airdrop</Link></li> */}
              <li>
                <Link className={""} to="/stake">
                  Stake
                </Link>
              </li>
              {/* <li>
                <Link className={""} to="/redeem">
                  Redeem
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        <div className="right">
          <div className="deer"></div>
          {/* <div className="arrow"></div> */}
          <div className="overlay"></div>
          <Switch>
            <Route path="/" exact component={Stake}></Route>
            <Route path="/pudu/" exact component={Stake}></Route>
            <Route path="/about" exact component={About}></Route>
            {/* <Route path="/tokenomics" exact component={Tokenomics}></Route> */}
            {/* <Route path="/airdrop" exact component={Airdrop}></Route> */}
            <Route path="/stake" exact component={Stake}></Route>
            {/* <Route path="/redeem" exact component={Redeem}></Route> */}
            <Route path="/*" component={NotFound}></Route>
          </Switch>
          <div className="copyright">PUDU 2022</div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default Layout
