// MealsContext.js
import { createContext, useContext, useEffect, useState } from "react";
import apiReq from "../apiReq";
import { useTables } from "./TablesContext"; // for socket

const MealsContext = createContext();

export const MealsProvider = ({ children }) => {
    const { socket } = useTables();
    const [mealsById, setMealsById] = useState({}); // id -> meal

    const loadMeals = async () => {
        const { data } = await apiReq.get("/meals/getMeals"); // returns all meals
        const map = Object.fromEntries(data.map(m => [m._id, m]));
        setMealsById(map);
    };
    
    const updateMeal = async (meal) => {
        await apiReq.put(`meals/${meal._id}`, meal);
        socket.emit('mealsChange', (res) => {
            const map = Object.fromEntries(res.meals.map(m => [m._id, m]));
            setMealsById(map);
        }); // notify server
        console.log(meal)
    };
    
    const createMeal = async (meal) => {
        await apiReq.post(`meals/`, meal);
        socket.emit('mealsChange', (res) => {
            const map = Object.fromEntries(res.meals.map(m => [m._id, m]));
            setMealsById(map);
        }); // notify server
        console.log(meal)
    };

    useEffect(() => {
        loadMeals();
    }, []);

    useEffect(() => {
        socket?.on('mealsChanged', async () => {
            await loadMeals();
        });
    }, [socket]);

    return (
        <MealsContext.Provider value={{ mealsById, refreshMeals: loadMeals, updateMeal, createMeal }}>
            {children}
        </MealsContext.Provider>
    );
};

export const useMeals = () => useContext(MealsContext);
