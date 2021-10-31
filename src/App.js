import axios from 'axios';
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';

// https://www.cluemediator.com/read-csv-file-in-react
function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);


  // process CSV data
  const processData = dataString => {

    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

    const list = []; // list of objects, each represent a row in the table.
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/); // typeof row = array[string]
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  }

  // handle file upload
  const handleFileUpload = e => {
    console.log(e.target)
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0]; //workbook.SheetNames is an ordered list of the sheets in the workbook
      const ws = wb.Sheets[wsname]; //wb.Sheets[sheetname] returns an object representing the worksheet.
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 }); //sheet_to_csv generates delimiter-separated-values output.
      processData(data);
    };
    reader.readAsBinaryString(file);
  }

  const AddSchoolCol = () => {
    setColumns([
      ...columns,
      {
        name: "Schools",
        selector: "Schools"
      }
    ]);

    const promises = []

    for (let i = 0; i < data.length; i++) {
      FetchData(data[i])
        .then(newHouseObj => {
          setData([...data], data[i].Schools = newHouseObj.Schools)
          console.log(`id = ${data[i].SAMPLE_ID} newHouseObj.Schools= ${newHouseObj.Schools}, data[i].Schools = ${data[i].Schools} `)
        })
        .catch(error => console.log(`Error in promises ${error}`))
    }

    // data.forEach(houseObj => {
    //   FetchData(houseObj)
    //     .then(newHouseObj => {

    //       console.log(setData([...data, data.filter(obj => obj.SAMPLE_ID === newHouseObj.SAMPLE_ID)[0].school = newHouseObj.school)]) 

    //     })
    //     .catch(error => console.log(`Error in promises ${error}`))
    // })

    //   data.forEach(houseObj => { promises.push(FetchData(houseObj)) })
    //   console.log(promises)
    //   Promise.all(promises).then(vals => console.log(vals)).catch(error => console.log(`Error in promises ${error}`))
    // }
  }
  const FetchData = async (rowObj) => {

    const res = await axios.post("http://localhost:8000/api/enrich/", rowObj)

    return res.data
  }


  return (
    <div>
      <h3>Read CSV file in React</h3>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />
      <button onClick={AddSchoolCol}>Add Schools</button>
      <DataTable
        pagination
        highlightOnHover
        columns={columns}
        data={data}
      />
    </div>
  );
}

export default App;