import React, {useEffect, useRef} from 'react';
import './TableOrder.css';

const OrderListItem = ({order}) => {
    const ref = useRef(0);
    const displayOrder = (tableOrder) => {
        return (
            <div key={ref.current++} className={'table_order_item_wrapper'}>
                <div className={"table_order_item_index"}>{tableOrder.ref}</div>
                {displayMeals(tableOrder.meals)}
                <div className={'table_order_item_price'}>{tableOrder.price}€</div>
            </div>
        )
    };
    
    const displayMeals = (meals) => {
        return (meals.map(meal => {
            return (
                <div key={meal.index} className={'table_order_item'}>
                    <div>{meal.meal.name}</div>
                </div>
            )
            })
        )
    }

    return (
        order.meals.map(tableOrder => {
            return displayOrder(tableOrder);
        })
    )
};

export default OrderListItem;