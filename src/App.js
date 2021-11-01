import axios from 'axios';
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import * as ReactBootStrap from 'react-bootstrap';

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false)


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
  }

  const addSchoolCol = () => {
    setLoading(true)
    setDisable(true)
    setColumns([
      ...columns,
      {
        name: "Schools",
        selector: row => row["Schools"]
      }
    ]);

    // for (let i = 0; i < data.length; i++) {
    //   (async () => {

    //     let newHouseObj = await fetchData(data[i])
    //     setData([...data], data[i].Schools = newHouseObj.Schools)
    //     console.log(`id = ${data[i].SAMPLE_ID} newHouseObj.Schools= ${newHouseObj.Schools}, data[i].Schools = ${data[i].Schools}`)
    //   })()
    // }

    const promises = []
    for (let i = 0; i < 10; i++) { promises.push(fetchData(data[i])) }
    Promise.all(promises)
      .then(res => {
        setLoading(false)
        console.log(res)
        const updatedData = data;
        res.forEach(houseObj => {
          if (houseObj !== "") {
            updatedData[updatedData.findIndex(obj => obj.SAMPLE_ID === houseObj.SAMPLE_ID)].Schools = houseObj.Schools;
          }
        })

        setData([...updatedData])
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
      {loading ?
        (<ReactBootStrap.Spinner animation="border" />)
        :
        (<DataTable
          pagination
          highlightOnHover
          columns={columns}
          data={data}
        />)}

      {data.map(obj => { return (<p>{obj.SAMPLE_ID}, {obj.Schools}</p>) })}
    </div>
  );
}

export default App;