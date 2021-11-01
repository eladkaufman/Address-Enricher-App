import axios from 'axios';

const loadBatch = (props) => {
    const { setLoading, setLoadMoreEnable, currBatchStart, BATCH_SIZE, data, setData, setBatchDataDisplay, setCurrBatchstart } = props
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
export default loadBatch;