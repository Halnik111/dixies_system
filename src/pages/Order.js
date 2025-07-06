import React, {useContext, useEffect, useRef, useState} from 'react';
import './Order.css';
import apiReq from "../apiReq";
import {useLocation, useNavigate} from "react-router-dom";
import OrderDetails from "../components/OrderDetails";
import {AuthContext} from "../context/AuthContext";
import {SocketContext} from "../context/SocketContext";
import OrderKeyboard from "../components/OrderKeyboard";

const Order = () => {
    const location = useLocation();
    const [orders, setOrders] = useState([{ref: 0, price: 0, meals: [], message: ''}]);
    const { currentUser } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    let orderRef = useRef(0);
    const [activeOrder, setActiveOrder] = useState(0);

    
    useEffect(() => {
        if (location.state.order) {
            setOrders(location.state.order.meals);
            orderRef.current = location.state.order.meals.length - 1;
        }
    }, [])
    const onNext = () => {
        // setOrders([
        //     ...orders, {meals: meals, ref: orderRef.current, price: priceRef.current, message: customMessage}
        // ]);
        // console.log(customMessage);
        // orderRef.current = orderRef.current + 1;
        // setMeals([]);
        // priceRef.current = 0;
        // setCustomMessage('');
        
        setOrders([...orders, {ref: ++orderRef.current, price: 0, meals: [], message: ''}]);
        setActiveOrder(orderRef.current)
    }

    const onConfirm = async () => {
        const table = location.state.table;
        let totalPrice = 0;
        await orders.forEach(a => totalPrice += a.price);
        // const totalPriceRound = totalPrice.toFixed(2);
        const totalPriceRound = Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
        const model = {
            orders, currentUser, table, totalPriceRound
        };
         await apiReq.post('/order/newOrder', model)
             .then(async res => {
                 console.log(model);
                 await apiReq.post('/tables/openTable', {table: table, orderId: res.data._id})
             })
             .then(() => {
                 socket.emit('openTable', 'Opening table: ' + table);
             })
             .finally(() => navigate('/tables'))
             .catch(err => console.log(err));
    }

    const displayOrder = (mealOrder) => {
            return (
                <div key={mealOrder.ref} className={activeOrder === mealOrder.ref ? 'meal_wrapper_active' : 'meal_wrapper'}
                     onClick={() => setActiveOrder(mealOrder.ref)}>
                    <div className={'orderItem_remove'}
                         onClick={() => {
                             setOrders(orders.filter(a => a.ref !== mealOrder.ref));
                         }}>
                        <svg width="18" height="18" viewBox="0 0 12 12" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 11L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M1 1L11 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    
                    <div className={'order_item_wrapper'}>
                        <div className={'order_item_meals'}>{mealOrder.meals.map(item => displayMeal(item, mealOrder))}</div>
                        <div className={'oder_item_divider'}></div>
                        <div className={'order_item_message'}>{mealOrder.ref} || {mealOrder.message}</div>
                    </div>
                </div>
            )
    }

    const displayMeal = (item, mealOrder) => {
        return (
            <div key={item.index} onClick={() => {
                if (activeOrder === mealOrder.ref) removeMeal(item)}
            }>{item.meal.name}</div>
        )
    };
    
    const removeMeal = (meal) => {
        const index = orders.findIndex(item => item.ref === activeOrder);
        const arr = [...orders];
        arr[index].price -= parseFloat(meal.meal.price);
        arr[index].meals = arr[index].meals.filter(a => a.index !== meal.index);
        setOrders(arr);
    }

    return (
        <div className={'order'}>
            <div className={'order_header'}>
                <div className={'order_header_table_name'}>{location.state.table}</div>
                <div className={'order_header_wrapper'}>
                    <div className={'order_header_buttons'}>
                        <svg onClick={() => navigate('/tables')} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 11L11 1" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M1 1L11 11" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <svg onClick={() => {onConfirm()}} width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 6.5C1 6.5 2.34315 11 4 11C5.5 11 12 1.5 12 1.5" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
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