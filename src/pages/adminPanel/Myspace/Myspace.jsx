import React, { useState, useEffect } from "react";
import "./Myspace.scss";
import { MdOutlineContentCopy } from 'react-icons/md';
import { useOutletContext } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fileAC } from '../../../store/action-creators/index'
import { bindActionCreators } from "redux";
import axios from "axios";
import moment from 'moment';
import Searchbar from "../../../components/searchBar/Searchbar";
import Pagination from "../../../components/Pagination/Pagination";
import { notify } from "../../../utils/services/notification";
import { getChainNetwork } from "../../../utils/services/chainNetwork";


function Myspace() {
    const [infoBarData, setInfoBarData] = useOutletContext();
    const [currentItems, setCurrentItems] = useState([]);
    const [orignalItems, setOrignalItems] = useState([]);
    const [totalSize, setTotalSize] = useState(0);
    const store = useSelector((store) => store);
    const dispatch = useDispatch()
    const _fileAC = bindActionCreators(fileAC, dispatch);
    const data = store.file || [];
    useEffect(() => {
        let userdata = store.auth;
        console.log(userdata, 'USERDATA');
        axios.get(`https://api.lighthouse.storage/api/lighthouse/get_uploads?network=${getChainNetwork()}&publicKey=${userdata.address}`)
            .then(response => {
                console.log(response);
                if (response['status'] === 200) {
                    _fileAC.setFileData(response['data']);
                    setCurrentItems(response['data']);
                    setOrignalItems(response['data']);
                    let allFiles = response['data'];
                    let total = 0;
                    allFiles.forEach(element => {
                        total = total + (parseInt(element?.fileSize?.hex, 16) / 1024)
                    });
                    setTotalSize(total.toFixed(2));
                }
            });
    }, []);
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        notify('Copied To Clipboard', 'success')
    }
    return (
        <div className="mySpace">
            <div className="mySpace__title">
                <p>My Space</p>
                <div className="searchBar">
                    <Searchbar orignalItems={orignalItems} setCurrentItems={setCurrentItems} />
                </div>
            </div>

            <div className="mySpace__tableContainer">
                <table>
                    <thead>
                        <tr className="tableHead">
                            <th>Name</th>
                            <th>CID</th>
                            <th>Size</th>
                            <th>Last Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(currentItems?.length > 0) && currentItems.map((item, i) =>
                            <tr key={i} className="ptr" onClick={() => { setInfoBarData(item) }} >
                                <td >{item?.fileName}</td>
                                <td>
                                    <span className="cid">{item.cid}</span>
                                    &nbsp;
                                    <span className="icon" onClick={() => { copyToClipboard(item.cid) }}><MdOutlineContentCopy /></span>
                                </td>
                                <td>{(parseInt(item?.fileSize?.hex, 16) / 1024).toFixed(1) + ' KB'}</td>
                                <td>{moment(parseInt(item?.timestamp?.hex, 16) * 1000).format("DD-MM-YYYY h:mm:ss")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mySpace__lowerContainer">
                <div className="sizeBar">
                    <p>Total Size : {totalSize + ' Kb'}</p>
                </div>
                <Pagination orignalData={data} setCurrentData={setCurrentItems} currentData={currentItems} itemsPerPage={7} />

            </div>
        </div>
    );
}

export default Myspace;
