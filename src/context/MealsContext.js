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

    useEffect(() => {
        loadMeals();
    }, []);

    useEffect(() => {
        socket?.on('mealsChanged', async () => {
            await loadMeals();
        });
    }, [socket]);

    return (
        <MealsContext.Provider value={{ mealsById, refreshMeals: loadMeals }}>
            {children}
        </MealsContext.Provider>
    );
};

export const useMeals = () => useContext(MealsContext);
