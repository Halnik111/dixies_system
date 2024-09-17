import React, {useRef} from 'react';
import './TableOrder.css';

const OrderListItem = ({order}) => {
    const ref = useRef(0);


    const displayOrder = (tableOrder) => {
        return (
            <div key={ref.current++} className={'table_order_item_wrapper'}>
                <div className={"table_order_item_index"}>{tableOrder.ref}</div>
                <div className={'table_order_item_content'}>
                    <div className={'table_order_item_details'}>
                        <div className={'tables_order_item_meals'}>{displayMeals(tableOrder.meals)}</div>
                        <div className={'table_order_item_price'}>{tableOrder.price}€</div>
                    </div>
                    {tableOrder.message && <div className={'table_order_item_message'}>{tableOrder.message}</div>}
                </div>
            </div>
        )
    };
    
    const displayMeals = (meals) => {
        return (meals.map(meal => {
            return (
                <div key={meal.index} className={'table_order_item'} style={{order: orderItem(meal)}}>
                    <div>{meal.meal.name}</div>
                </div>
            )
            })
        )
    }

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
        order.meals.map(tableOrder => {
            return displayOrder(tableOrder);
        })
    )
};

export default OrderListItem;