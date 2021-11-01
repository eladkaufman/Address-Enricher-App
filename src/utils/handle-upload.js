import * as XLSX from 'xlsx';
import processData from './process-data';
const handleUpload = (props) => {
    const { e, setDisable, setData, setBatchDataDisplay, setColumns, BATCH_SIZE } = props

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const dataString = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        const { list, columns } = processData(dataString);
        setData(list);
        setBatchDataDisplay(list.slice(0, BATCH_SIZE))
        setColumns(columns);

    };
    reader.readAsBinaryString(file);
    setDisable(false)

}



export default handleUpload;