import React, {useEffect, useRef, useState, useMemo} from 'react';
import apiReq from "../apiReq";
import './OrderKeyboard.css';

const OrderKeyboard = ({ orders, setOrders, activeOrder }) => {
    const [menu, setMenu] = useState([]);
    let mealRef =useRef(0);
    const [switchControl, setSwitchControl] = useState('meals');
    const [message, setMessage] = useState('');
    const index = orders.findIndex(item => item._id === activeOrder);
    const arr = [...orders];

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        await apiReq.get('/meals/getMeals')
            .then(res => {
                setMenu(res.data)
            });
    };

    const handleClick = (meal) => {
        mealRef.current = arr[index].meals[arr[index].meals.length - 1]?.index + 1 || 0; // Increment index for new meal
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
        arr[index].message = message;
        setOrders(arr);
        setMessage('');
    }

    // manual order first, then A–Z
    const sortByManual = (a, b) =>
        (a?.sortIndex ?? 1e9) - (b?.sortIndex ?? 1e9) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" });


    const groupedMenu = useMemo(() => {
        const base = {
            burger: [], sides: [], dip: [], special: [], dessert: [],
            beer: [], wine: [], coffee: [], lemonade: [], tea: [], beverage: []
        };
        (menu || []).forEach(item => {
            if (base[item.category]) base[item.category].push(item);
        });
        Object.keys(base).forEach(k => {
            base[k] = base[k].slice().sort(sortByManual);
        });
        return base;
    }, [menu]);
    
    const menuKeyboard = () => {
        
        
        


        return (
            switchControl === 'meals' ?
                (
                    <div className={'order_keyboard_keys'}>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.burger)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.sides)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.dip)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.special)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.dessert)}</div>
                    </div>
                ) : (
                    <div className={'order_keyboard_keys'}>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.beverage)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.lemonade)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.beer)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.coffee)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.wine)}</div>
                        <div className={'order_keyboard_category'}>{keyBoardKey(groupedMenu.tea)}</div>
                    </div>
                )

        )
    };

    const keyBoardKey = (category = []) => {
        return category.map(item => <div key={item._id}
                                         className={`menuKey ${item.category} ${item.available === false ? "unavailable" : ""}`}
                                         onClick={() => (item.available === false ? null : handleClick(item))}
                                         aria-disabled={item.available === false}
                                         title={item.available === false ? `${item.name} — unavailable` : item.name}
        >
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