import React from 'react';

const Table = (props) => {
    const { columns, batchDataDisplay } = props
    return (
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
                        <tr key={houseObj.SAMPLE_ID + rowIdx}>
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
    );
}

export default Table;
