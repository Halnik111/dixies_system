import React, {useEffect, useRef, useState} from 'react';
import './Order.css';
import '../components/Elements.css';
import {useLocation, useNavigate} from "react-router-dom";
import OrderKeyboard from "../components/OrderKeyboard";
import { useOrders } from "../context/OrdersContext";

const Order = () => {
    const location = useLocation();
    const [tableOrder, setTableOrder] = useState([]);
    const [orders, setOrders] = useState([{_id: 0, price: 0, meals: [], message: '', tableOrderId: location.state.table._id}]);
    const { confirmOrder, orderLoading } = useOrders();
    const navigate = useNavigate();
    let orderRef = useRef(0);
    const [activeOrder, setActiveOrder] = useState(0);
    let ref = 1;

    
    useEffect(() => {
        if (location.state.order) {
            console.log(location.state.order.orders);
            setOrders(location.state.order.orders);
            orderRef.current = location.state.order.orders.length - 1;
            console.log('Order loaded from state:', location.state.order);
        }
    }, [])
    const onNext = () => {
        setOrders([...orders, {_id: ++orderRef.current, price: 0, meals: [], message: '', tableOrderId: location.state.table._id}]);
        setActiveOrder(orderRef.current)
    }

    const onConfirm = async () => {
        const table = location.state.table;
        if (!location.state.order) {
            await confirmOrder(orders, table, null);
            navigate('/tables');
        } else {
            await confirmOrder(orders, table, location.state.order._id);
            navigate('/tables');
        }
    }

    const displayOrder = (mealOrder) => {
            return (   
                <div key={mealOrder._id} className={activeOrder === mealOrder._id ? 'meal_wrapper_active' : 'meal_wrapper'}
                     onClick={() => setActiveOrder(mealOrder._id)}>
                    <div className={'orderItem_remove'}
                         onClick={() => {
                             setOrders(orders.filter(a => a._id !== mealOrder._id));
                         }}>
                        <svg width="18" height="18" viewBox="0 0 12 12" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 11L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M1 1L11 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    
                    <div className={'order_item_wrapper'}>
                        <div className={'order_item_meals'}>{displayMeal(mealOrder)}</div>
                        <div className={'oder_item_divider'}></div>
                        <div className={'order_item_message'}>{ref++} || {mealOrder.message}</div>
                    </div>
                </div>
            )
    }

    const displayMeal = (mealOrder) => {
        let ref = 0;
        return (
            mealOrder?.meals.map(item => {
                return (
                    <div key={ref++} onClick={() => {
                        if (activeOrder === mealOrder._id) removeMeal(item)}
                    }>{item.meal?.name}</div>
                )
            }
        ))
    };
    
    const removeMeal = (meal) => {
        const index = orders.findIndex(item => item._id === activeOrder);
        const arr = [...orders];
        if (arr[index].meals.some(a => a.meal.category === 'burger') && arr[index].meals.some(a => a.meal.category === 'sides') && arr[index].meals.some(a => a.meal.category === 'dip')) {
            arr[index].price += 1; // Remove discount for burger + side combo
            console.log('Discount removed for burger + side combo');
        }
        arr[index].price -= parseFloat(meal.meal.price);
        arr[index].meals = arr[index].meals.filter(a => a.index !== meal.index);
        setTableOrder(arr);
    }

    return (
        <div className={'order'}>
            <div className={'order_header'}>
                <div className={'order_header_table_name'}>{location.state.table.name}</div>
                <div className={'order_header_wrapper'}>
                    <div className={'order_header_buttons'}>
                        <svg className={'order_header_cancel'} onClick={() => navigate('/tables')} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 11L11 1" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M1 1L11 11" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {orderLoading ? (
                            <div className="orderConfirm_loading">
                                <div className="orderConfirm_spinner"></div>
                            </div>
                        ) : (
                            <svg className={'order_header_confirm'} onClick={() => {
                                onConfirm()
                            }} width="13" height="12" viewBox="0 0 13 12" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 6.5C1 6.5 2.34315 11 4 11C5.5 11 12 1.5 12 1.5" stroke="black"
                                      strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            <div className={'order_content'}>
                <div className={"order_meals"}>
                    <div className={'order_meals_divider'}></div>
                    <div className={'order_meals_list'}>
                            {orders.map(item => displayOrder(item))}
                    </div>
                    <div className={'order_meals_next_button'} onClick={() => {onNext()}}>
                        NEXT
                    </div>
                </div>
                <OrderKeyboard orders={orders} setOrders={setOrders} activeOrder={activeOrder}/>
            </div>
        </div>
    );
};

export default Order;