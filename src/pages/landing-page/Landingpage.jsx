import React, { useEffect, useState } from "react";
import "./Landingpage.scss";
import { BsDiscord, BsFacebook, BsTwitter } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { authAC } from "../../store/action-creators";
import { getChainNetwork } from "../../utils/services/chainNetwork";
import axios from 'axios';
import { ethers } from "ethers";
import { notify } from "../../utils/services/notification";


function isMobileDevice() {
    return "ontouchstart" in window || "onmsgesturechange" in window;
}



async function Connect(onConnected) {
    try {
        if (!window.ethereum) {
            alert("Get MetaMask!");
            return;
        }
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        onConnected(accounts[0]);
    } catch (err) {
        console.log(err, '----');
        notify(err['message'], 'error');
    }
}


const sign_message = async (setUserAddress) => {
    if (!window.ethereum) {
        notify('Metamask Missing - Please Install Metamask', 'error');
        return;
    } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let address = undefined;
        try {
            address = await signer.getAddress();
        } catch (e) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            notify('Please Login to Metamask', 'error');
            return;
        }
        console.log(address, '---');
        const res = await axios.get(`https://api.lighthouse.storage/api/lighthouse/get_message?publicKey=${address}`);
        const message = res.data;
        const signed_message = await signer.signMessage(message);
        const obj = {
            message: message,
            signed_message: signed_message,
            address: await signer.getAddress()
        }
        setUserAddress(obj.address);
        return;
    }

}



function Landingpage() {
    const _navigate = useNavigate();
    const dispatch = useDispatch();
    const _auth = bindActionCreators(authAC, dispatch);
    const [userAddress, setUserAddress] = useState("");
    const _currentAuth = useSelector((store) => store.auth);

    useEffect(() => {
        if (userAddress.length > 0) {
            let networkVersion = window.ethereum.networkVersion;
            let chain = getChainNetwork(networkVersion);
            let network = getChainNetwork(networkVersion);
            _auth.setAuthData({
                address: userAddress,
                chain: chain,
                network: network,
                networkVersion: networkVersion,
            });
            userAddress.length > 0 && _navigate("/dashboard");
        }
    }, [_auth, _navigate, userAddress]);

    return (
        <div className="landingPage">
            <div className="landingPage__overlay"></div>
            <div className="landingPage__overlayRings"></div>
            <div className="landingPage__sideBar">
                <div className="header">
                    <img src="/logo.png" alt="" />
                    <p className="gradient__text">Origami</p>
                </div>
                <div className="title">
                    <p>
                        A <span className="gradient__text_">3D Model</span>{" "}
                        <br />Platform for <span className="gradient__text_">Everyone</span>
                    </p>

                    <div className="icons">
                        <a href="#" target="_blank" rel="noreferrer"> <BsDiscord /></a>
                        <a href="#" target="_blank" rel="noreferrer"> <BsTwitter /></a>
                    </div>
                </div>
                <div className="footer">
                    <div className="footer__heading">
                    <div class="circle"></div> Live on:
                    </div>

                    <div className="footer__chains">
                        <img src="/chain_icons/binance.png" alt="binanceLogo" />
                        <img src="/chain_icons/polygon.png" alt="polygonLogo" />
                        {/*
                        <img src="/chain_icons/fantom.png" alt="fantomLogo" />
                        <img src="/chain_icons/optimism.svg" alt="optimismLogo" />
                        */}
                    </div>

                </div>
            </div>
            <div className="landingPage__loginBar">
                <div className="landingPage__loginBar_pattern"></div>

                <div className="landingPage__loginBar_iconsContainer">
                    <div className="loginBox ptr" onClick={() => sign_message(setUserAddress)}>
                        <img src="/icon/metamask.png" alt="metamaskIcon" />
                        <p className="m-1">Metamask</p>
                    </div>
                    {/* <div className="loginBox ptr" onClick={goToDashboard}>
                    <img src="/icons/walletConnect.png" alt="walletConnect" />
                    <p>Wallet Connect</p>
                </div> */}
                </div>
            </div>
        </div>
    );
}

export default Landingpage;
