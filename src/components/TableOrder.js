import React from 'react';
import './TableOrder.css';

const OrderListItem = ({tableOrder}) => {
    let ref = 1;
    
    const displayMeals = (meals) => {
        let i = 0
        return (meals.map(item => {
            return (
                <div key={i++} className={'table_order_item'} style={{order: orderItem(item)}}>
                    <div>{item.meal.name}</div>
                </div>
            )
            })
        )
    }

    const orderItem = (meal) => {
        if (meal.category === 'burger' || meal.category === 'special' || meal.category === 'dessert')
            return 1;
        else if (meal.category === 'sides')
            return 2;
        else if (meal.category === 'dip')
            return 3;
        else return 4;
    }

    return (
        tableOrder.map(order => {
            return (
            <div key={order._id} className={'table_order_item_wrapper'}>
                <div className={"table_order_item_index"}>{ref++}</div>
                <div className={'table_order_item_content'}>
                    <div className={'table_order_item_details'}>
                        <div className={'tables_order_item_meals'}>{displayMeals(order.meals)}</div>
                        <div className={'table_order_item_price'}>{order.price}€</div>
                    </div>
                    {order.message && <div className={'table_order_item_message'}>{order.message}</div>}
                </div>
            </div>
            )
        })
    )
};

export default OrderListItem;