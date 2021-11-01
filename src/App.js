import axios from 'axios';
import './App.css'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import * as ReactBootStrap from 'react-bootstrap';

const BATCH_SIZE = 4

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [batchDataDisplay, setBatchDataDisplay] = useState([])
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadMoreEnable, setLoadMoreEnable] = useState(false)
  const [currBatchStart, setCurrBatchstart] = useState(0)

  const processData = dataString => {

    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }
    const columns = headers.map(c => ({
      name: c,
      selector: row => row[c],
    }));
    setData(list);
    setBatchDataDisplay(list.slice(0, BATCH_SIZE))
    setColumns(columns);

  }

  const handleFileUpload = e => {

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
    setDisable(false)
  }

  const addSchoolCol = () => {

    setDisable(true)
    setColumns([
      ...columns,
      {
        name: "Schools",
        selector: row => row["Schools"]
      }
    ]);
    loadBatch()
  }


  const loadBatch = () => {

    setLoading(true)
    setLoadMoreEnable(false)
    const promises = []
    for (let i = currBatchStart; i < currBatchStart + BATCH_SIZE && i < data.length; i++) { promises.push(fetchData(data[i])) }
    Promise.all(promises)
      .then(res => {

        const updatedData = data;
        res.forEach(houseObj => {
          if (houseObj !== "") {
            updatedData[updatedData.findIndex(obj => obj.SAMPLE_ID === houseObj.SAMPLE_ID)].Schools = houseObj.Schools;
          }
        })

        setData([...updatedData])
        setBatchDataDisplay(updatedData.splice(0, currBatchStart + BATCH_SIZE))
        setLoading(false)
        setCurrBatchstart(currBatchStart + BATCH_SIZE)
        if (currBatchStart + BATCH_SIZE >= data.length) {
          setLoadMoreEnable(false)
        }
        setLoadMoreEnable(true)
      })
      .catch(err => console.log(err))
  }


  const fetchData = async (rowObj) => {

    const res = await axios.post("http://localhost:8000/api/enrich/", rowObj)
    return res.data
  }


  return (
    <div>
      <h3>Households Info</h3>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />
      <button onClick={addSchoolCol} disabled={disable}>Add Schools</button>
      {loading && (<ReactBootStrap.Spinner animation="border" />)}

      <table border="1" style={{ margin: "3px" }}>
        <thead>
          <tr>
            {columns.map((col, idx) => {
              return (
                <th key={col + idx}>{col.name}</th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {batchDataDisplay.map((houseObj, rowIdx) => {
            return (
              <tr key={houseObj + rowIdx}>
                {Object.values(houseObj).map((value, idx) => {
                  return (
                    <td key={value + idx} >{value}</td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>



      <button onClick={loadBatch} disabled={!loadMoreEnable}>Load More</button>
    </div >
  );
}

export default App;