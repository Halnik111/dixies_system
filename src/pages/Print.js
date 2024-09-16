import React, {useState} from 'react';
import './Print.css';
import {useLocation} from "react-router-dom";

const Print = () => {
    const location = useLocation();
    const [order, setOrder] = useState(location.state.order);


    const test = () => {
        console.log(location.state.order);
    }

    const fixTo2 = (num) => {
        return parseFloat(num).toFixed(2)
    }

    const displayOrder = (tableOrder) => {
        return (
            <div key={tableOrder.ref} className={'print_order_outer_wrapper'}>
                <div className={'print_order_item_details'}>
                    <div className={"table_order_item_index"}>{tableOrder.ref}</div>
                    <div className={'print_order_item_meals'}>
                        {displayMeals(tableOrder.meals)}
                        {tableOrder.message &&
                            <div className={'print_order_item_meals_message'}>
                                {tableOrder.message}
                            </div>
                        }
                    </div>
                </div>
                <div className={'print_order_item_total'}>
                    <div>Total: </div>
                    <div>{tableOrder.price} Eur</div>
                </div>
            </div>
        )
    };

    const displayMeals = (meals) => {
        return (meals.map(meal => {
                return (
                    <div key={meal.index} className={'print_order_item'} style={{order: orderItem(meal)}}>
                        <div>{meal.meal.name}</div>
                        <div>{fixTo2(meal.meal.price)} Eur</div>
                    </div>
                )
            })
        )
    };

    const orderItem = (item) => {
        if (item.meal.category === 'burger' || item.meal.category === 'special' || item.meal.category === 'dessert')
            return 1;
        else if (item.meal.category === 'sides')
            return 2;
        else if (item.meal.category === 'dip')
            return 3;
        else return 4;
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
                    {order.meals.map(tableOrder => {
                        return displayOrder(tableOrder);
                    })}
                </div>
                <div className={'print_order_summary'}>
                    <div>Order Total:</div>
                    <div>{order.price} Eur</div>
                </div>
            </div>
        </div>
    );
};

export default Print;