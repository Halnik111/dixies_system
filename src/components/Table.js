import React, {useEffect, useState} from 'react';
import "./Table.css";

const Table = ({table}) => {
    const [tableColor, setTableColor] = useState("white");


    useEffect(() => {
        tableStyling();
    },[table])

    const tableStyling = () => {
        if (table.status === "taken") {
            setTableColor("indianred")
        }
        else if(table.status === "reserve") {
            setTableColor("orange")
        }
    }

    return (
        <div className={"table"} style={{color: tableColor, borderColor: tableColor}}>
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