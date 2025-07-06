import React, {useEffect, useState} from 'react';
import './OrderDetails.css';

const OrderDetails = ({ mealOrder, meals, setMeals, setOrders, orders}) => {
    const [activeOrder, setActiveOrder] = useState(null);
    
    useEffect(() => {
        if (activeOrder) {
            setMeals([...activeOrder.meals, meals]);
            console.log(activeOrder.meals);
        }
    },[orders.length])
    
    const displayMealOrder = () => {
        return (
            <div>{mealOrder.ref}</div>
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

    const displayActiveMeal = () => {
        console.log(meals)
        return meals.map(meal => {
            return (
                <div key={meal.index} className={'meal_wrapper'}>
                    <div>{meal.name}</div>
                    <div>{meal.message}</div>
                </div>
            )
        })
    }

    return displayMealOrder();
};

export default OrderDetails;