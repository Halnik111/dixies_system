import React, {useContext, useEffect, useRef, useState} from 'react';
import './Order.css';
import apiReq from "../apiReq";
import {useLocation, useNavigate} from "react-router-dom";
import OrderDetails from "../components/OrderDetails";
import {AuthContext} from "../context/AuthContext";
import {SocketContext} from "../context/SocketContext";

const Order = () => {
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [meals, setMeals] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const location = useLocation();
    const navigate = useNavigate();
    let mealRef =useRef(0);
    let orderRef = useRef(0);
    
    let priceRef = useRef(0);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        await apiReq.get('/meals/getMeals')
            .then(res => {
                setMenu(res.data)
            })
    };
    
    const handleClick = (meal) => {
        setMeals([
            ...meals, {meal, index: mealRef.current}
        ]);
        mealRef.current = mealRef.current + 1;
        priceRef.current += parseFloat(meal.price);
    }

const menuKey = () => {
        return menu.map(meal => <div key={meal._id} className={`menuKey ${meal.category}`} onClick={() => handleClick(meal)}>
            {meal.name}
        </div>)
    };

    const displayCurrentMealTicket = () => {
        let index = 0;
        return (
            meals.map(meal => {
                return (
                    <div key={index++}>{meal.meal.name}</div>
                )
            })
        )
    }

    const onNext = () => {
        setOrders([
            ...orders, {meals: meals, ref: orderRef.current, price: priceRef.current}
        ]);
        orderRef.current = orderRef.current + 1;
        setMeals([]);
        priceRef.current = 0;
    }

    const onConfirm = async () => {
        const table = location.state.table;
        let totalPrice = 0;
        orders.forEach(a => totalPrice += a.price);
        
        const model = {
            orders, currentUser, table, totalPrice
        };
         await apiReq.post('/order/newOrder', model)
             .then(async res => {
                 await apiReq.post('/tables/openTable', {table: table, orderId: res.data._id})
             })
             .then(() => {
                 socket.emit('openTable', 'Opening table: ' + table);
             })
             .finally(() => navigate('/tables'))
             .catch(err => console.log(err));
    }

    return (
        <div className={'order'}>
            <div className={'order_header'}>
                <div className={'order_header_table_name'}>{location.state.table}</div>
                <div className={'order_header_wrapper'}>
                    <div className={'order_header_buttons'}>
                        <div onClick={() => {onNext()}}>NEXT</div>
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
                    <div className={'order_current'}>
                        {displayCurrentMealTicket()}
                    </div>
                    <div className={'order_meals_divider'}></div>
                    <OrderDetails orders={orders} setOrders={setOrders} />
                </div>
                <div className={'order_keyboard'}>
                    <div className={'order_keyboard_custom'}>

                    </div>
                    <div className={'order_keyboard_keys'}>
                        {menuKey()}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Order;