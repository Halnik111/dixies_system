import React, {useEffect, useRef, useState} from 'react';
import apiReq from "../apiReq";
import './OrderKeyboard.css';

const OrderKeyboard = ({ orders, setOrders, activeOrder }) => {
    const [menu, setMenu] = useState([]);
    let mealRef =useRef(0);
    const [switchControl, setSwitchControl] = useState('meals');
    const [message, setMessage] = useState('');
    const index = orders.findIndex(item => item.ref === activeOrder);
    const arr = [...orders];

    useEffect(() => {
        fetchMenu();
        
        console.log(mealRef.current)
    }, []);

    const fetchMenu = async () => {
        await apiReq.get('/meals/getMeals')
            .then(res => {
                setMenu(res.data)
            });
    };

    const handleClick = (meal) => {
        mealRef.current = arr[index].meals[arr[index].meals.length - 1]?.index + 1 || 0; // Increment index for new meal
        console.log(mealRef.current)
        arr[index].meals.push({meal, index: mealRef.current });
        arr[index].price += parseFloat(meal.price);
        if (arr[index].meals.some(a => a.meal.category === 'burger') && arr[index].meals.some(a => a.meal.category === 'sides') && arr[index].meals.some(a => a.meal.category === 'dip')) {
            arr[index].price -= 1; // Apply discount for burger + side combo
            console.log('Discount applied for burger + side combo');
        }
        setOrders(arr);
        console.log(orders)
        //mealRef.current = mealRef.current + 1;
    }
    
    const confirmCustom = async (e) => {
        e.preventDefault();
        const index = orders.findIndex(item => item.ref === activeOrder);
        const arr = [...orders];
        arr[index].message = message;
        setOrders(arr);
        setMessage('');
    }

    const menuKeyboard = () => {
        const fullMenu = {
            burger: [],
            sides: [],
            dip: [],
            special: [],
            dessert: [],
            beer: [],
            wine: [],
            coffee: [],
            lemonade: [],
            tea: [],
            beverage: [],
        }

        menu.map(item => {
            switch (item.category) {
                case 'burger':
                    fullMenu.burger.push(item);
                    break;
                    
                case 'sides':
                    fullMenu.sides.push(item);
                    break;

                case 'dip':
                    fullMenu.dip.push(item);
                    break;

                case 'special':
                    fullMenu.special.push(item);
                    break;

                case 'dessert':
                    fullMenu.dessert.push(item);
                    break;

                case 'beer':
                    fullMenu.beer.push(item);
                    break;

                case 'wine':
                    fullMenu.wine.push(item);
                    break;

                case 'coffee':
                    fullMenu.coffee.push(item);
                    break;

                case 'lemonade':
                    fullMenu.lemonade.push(item);
                    break;

                case 'tea':
                    fullMenu.tea.push(item);
                    break;

                case 'beverage':
                    fullMenu.beverage.push(item);
                    break;
            }
        });
        
        


        return (
            switchControl === 'meals' ?
                (
                    <div className={'order_keyboard_keys'}>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.burger)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.sides)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.dip)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.special)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.dessert)}</div>
                    </div>
                ) : (
                    <div className={'order_keyboard_keys'}>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.beverage)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.lemonade)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.beer)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.coffee)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.wine)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(fullMenu.tea)}</div>
                    </div>
                )

        )
    };

    const keyBoardKey = (category) => {
        return category.map(item => <div key={item._id} className={`menuKey ${item.category}`}
                                         onClick={() => handleClick(item)}>
            {item.name}
        </div>)
    };

    return (
        <div className={'order_keyboard'}>
            <form className={'order_keyboard_custom_wrapper'}>
                <input name={'custom'} className={'order_keyboard_custom'} value={message} onChange={event => setMessage(event.target.value)}/>
                <button className={'order_keyboard_custom_button button'} type={"button"} onClick={confirmCustom}>OK</button>
            </form>
            <div className={'order_keyboard_switches'}>
                <div className={switchControl === 'meals' ? 'keyboard_switch_active' : 'order_keyboard_switch'}
                     onClick={() => setSwitchControl('meals')}>Meals
                </div>
                <div className={switchControl === 'drinks' ? 'keyboard_switch_active' : 'order_keyboard_switch'}
                     onClick={() => setSwitchControl('drinks')}>Drinks
                </div>
            </div>
            {menuKeyboard()}
        </div>
    );
};

export default OrderKeyboard;