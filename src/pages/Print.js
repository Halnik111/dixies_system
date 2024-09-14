import React, {useState} from 'react';
import './Print.css';
import {useLocation} from "react-router-dom";

const Print = () => {
    const location = useLocation();
    const [order, setOrder] = useState(location.state.order);


    const test = () => {
        console.log(location.state.order);
    }

    return (
        <div className={'print'}>
            <div className={'print_button'} onClick={() => test()}>
                Print!
            </div>
            <div id={'print_section'} className={'print_content'}>
                <div className={'print_header'}>
                    <div className={'print_header_company'}>Dixie's Burger</div>
                    <div className={'print_header_details'}>
                        <div className={'print_header_employee'}>Service: {order.openedBy.name}</div>
                        <div className={'print_header_table'}>Table: {order.tableId}</div>
                    </div>
                    <div className={'print_header_time'}>
                        Created: {order.createdAt}
                    </div>
                </div>
                <div className={'print_order'}>
                    <div className={'print_order_wrapper'}>
                        <div className={'print_order_meal'}>Zel. Quesadilla</div>
                        <div className={'print_order_price'}>10Eur</div>
                    </div>
                    <div className={'print_order_meal'}>Bataty</div>
                    <div className={'print_order_meal'}>Alabama White</div>
                </div>
            </div>
        </div>
    );
};

export default Print;