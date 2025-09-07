import React, {useEffect, useState} from 'react';
import './Tables.css';
import '../components/Elements.css';
import Table from "../components/Table";
import TableDetails from "../components/TableDetails";
import { useTables } from "../context/TablesContext";
import {useOrders} from "../context/OrdersContext";
import order from "./Order";

const Tables = () => {
    const { tables, loading, fetchTables } = useTables();
    const { orderLoading } = useOrders();
    const [activeTable, setActiveTable] = useState(null);

    useEffect(() => {
        if (tables.length < 1) {
            fetchTables();
        }
        setActiveTable(tables.find(i => i._id === activeTable));
    }, [tables]);
    
    return (
        <div className={'tables'}>
            <div className={'tables_wrapper'}>
                <div className={'tables_header'}>
                    <div>ORDER SYSTEM</div>
                </div>
                <div className={'tables_window'}>
                    <div className={'tables_grid'}>
                        {tables.map(table => <Table key={table._id} table={table} setActiveTable={setActiveTable}/>)}
                        <div id={'table_divider_vertical'}></div>
                        <div id={'table_divider_horizontal'}></div>
                    </div>
                </div>
                <TableDetails table={activeTable} setActiveTable={setActiveTable}/>
                {loading || orderLoading ? (
                        <div className="tables_loading">
                            <div className="tables_spinner"></div>
                        </div>
                ) : (
                    <div className="tables_checkmark">
                        <div className="tables_checkmark_stem"></div>
                        <div className="tables_checkmark_kick"></div>
                    </div>
                )}
            </div>
            <div className={''}>
            </div>
        </div>
    );
};

export default Tables;