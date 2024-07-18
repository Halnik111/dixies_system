import React, {useEffect, useState} from 'react';
import "./Table.css";

const Table = ({table, setActiveTable}) => {
    const [tableColor, setTableColor] = useState("white");


    useEffect(() => {
        tableStyling();
    },[table]);

    const clickTable = () => {
        setActiveTable(table);
    }

    const tableStyling = () => {
        if (table.status === "taken") {
            setTableColor("indianred")
        }
        else if(table.status === "reserve") {
            setTableColor("orange")
        }
        else if (table.status === 'open') {
            setTableColor('white')
        }
    }

    return (
        <div id={table.name} className={"table"} style={{color: tableColor, borderColor: tableColor}} onClick={() => clickTable()}>
            <div>
                {table.name}
            </div>
            <div>
                {table.status}
            </div>
        </div>
    );
};

export default Table;