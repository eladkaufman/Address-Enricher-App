import './App.css'
import React, { useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import Table from './components/table'
import handleUpload from './utils/handle-upload';
import loadBatch from './utils/load-batch';

const BATCH_SIZE = 4

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [batchDataDisplay, setBatchDataDisplay] = useState([])
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadMoreEnable, setLoadMoreEnable] = useState(false)
  const [currBatchStart, setCurrBatchstart] = useState(0)

  const handleFileUpload = e => {
    handleUpload({ e, setDisable, setData, setBatchDataDisplay, setColumns, BATCH_SIZE })
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
    loadNextBatch()
  }

  const loadNextBatch = () => {
    loadBatch({ setLoading, setLoadMoreEnable, currBatchStart, BATCH_SIZE, data, setData, setBatchDataDisplay, setCurrBatchstart })
  }


  return (
    <div>
      <h3>Households Info</h3>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />
      <button
        onClick={addSchoolCol}
        disabled={disable}>
        Add Schools
      </button>

      {loading && (<ReactBootStrap.Spinner animation="border" />)}

      <Table
        columns={columns}
        batchDataDisplay={batchDataDisplay} />

      <button
        onClick={loadNextBatch}
        disabled={!loadMoreEnable}>
        Load More
      </button>
    </div >
  );
}

export default App;