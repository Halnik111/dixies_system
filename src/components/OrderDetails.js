import React from 'react';
import './OrderDetails.css';

const OrderDetails = ({ orders, setOrders }) => {

    const displayMealOrder = (mealOrder) => {
            return (
                <div key={mealOrder.ref} className={'orderListItem'}>
                    <div className={'orderItem_remove'} onClick={() => setOrders(orders.filter(a => a.ref !== mealOrder.ref))}>
                        <svg width="18" height="18" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 11L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M1 1L11 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <div className={'meals_container'}>{displayMeal(mealOrder)}</div>
                        {mealOrder.message && <div className={'orderListItem_custom_message'}>{mealOrder.message}</div>}
                    </div>
                </div>
            )
    };

    const displayMeal = (mealOrder) => {
        return mealOrder.meals.map(meal => {
            return (
                <div key={meal.index} className={'meal_wrapper'}>
                    <div>{meal.meal.name}</div>
                    <div>{meal.message}</div>
                </div>
            )
        })
    }

    return (
        orders.map(mealOrders=> {
            return displayMealOrder(mealOrders)
        })
    );
};

export default OrderDetails;