import { createContext, useContext, useEffect, useMemo, useState } from "react";
import apiReq from "../apiReq";
import { useTables } from "./TablesContext";
import { useAuth } from "./AuthContext";

export const OrderContext = createContext();

const normalizeDate = (v) => {
    if (!v) return null;
    if (typeof v === "string" || typeof v === "number") return new Date(v);
    if (v.$date) {
        const raw = typeof v.$date === "object" && v.$date.$numberLong ? v.$date.$numberLong : v.$date;
        return new Date(Number(raw));
    }
    if (v.$numberLong) return new Date(Number(v.$numberLong));
    try { return new Date(v); } catch { return null; }
};

const selectLastNDays = (list, n = 7) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = new Date(startOfToday.getTime() - (n - 1) * 86400000);
    return (list || [])
        .filter(o => {
            const d = normalizeDate(o.createdAt);
            return d && d >= cutoff;
        })
        .sort((a, b) => normalizeDate(b.createdAt) - normalizeDate(a.createdAt));
};

export const OrderProvider = ({ children }) => {
    const { socket } = useTables();
    const { user } = useAuth();

    // live/active table orders (your existing behavior)
    const [tableOrders, setTableOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    // historical orders for dashboard
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // ------- existing sockets for active table orders -------
    useEffect(() => {
        fetchActiveTableOrders();
    }, []);

    useEffect(() => {
        socket?.on("tableChanged", (data) => {
            setTableOrders(data);
            setActiveOrders(data.orders);
        });
        socket?.on("tableClosed", (data) => {
            setTableOrders(data);
            setActiveOrders(data.orders);
        });
    }, [socket]);

    const confirmOrder = async (ordersToSave, table, tableOrderId) => {
        setSubmitLoading(true);
        let totalPrice = 0;
        ordersToSave.forEach(a => totalPrice += a.price);
        const totalPriceRound = Math.round(totalPrice * 100) / 100;

        try {
            if (tableOrderId) {
                await apiReq.put(`/tableOrder/editTableOrder/${tableOrderId}`, {
                    orders: ordersToSave, tableId: table._id, price: totalPriceRound
                });
            } else {
                const res = await apiReq.post("/tableOrder/newTableOrder", {
                    orders: ordersToSave, openedBy: user.id, tableId: table._id, price: totalPriceRound
                });
                await apiReq.post("/tables/openTable", { table, tableOrderId: res.data._id });
            }
            socket.emit("tableChange", table, (res) => {
                setTableOrders(res.tableOrders);
                setActiveOrders(res.tableOrders.orders);
            });
        } catch (err) {
            console.log(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchActiveTableOrders = async () => {
        try {
            const res = await apiReq.get("/tableOrder/getAllActiveTableOrders");
            setTableOrders(res.data);
            setActiveOrders(res.data.orders);
        } catch (err) {
            console.log(err);
        }
    };

    // ------- new: historical orders fetch (for dashboard) -------
    const refresh = async ({ since, until, limit } = {}) => {
        setIsLoading(true); setError("");
        try {
            const params = new URLSearchParams();
            if (since) params.set("since", new Date(since).toISOString());
            if (until) params.set("until", new Date(until).toISOString());
            if (limit) params.set("limit", String(limit));
            const res = await apiReq.get(`/order/listOrders${params.toString() ? "?" + params.toString() : ""}`);
            const list = Array.isArray(res.data) ? res.data : res.data.orders || [];
            setOrders(list);
            return list;
        } catch (e) {
            setError(e.message || "Failed to load orders");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // auto-load last 30 days on mount (dashboard)
    useEffect(() => {
        const since = new Date(Date.now() - 30 * 86400000);
        refresh({ since, limit: 1000 });
    }, []);

    const value = {
        // live/active
        tableOrders,
        activeOrders,
        confirmOrder,
        fetchActiveTableOrders,
        orderLoading: submitLoading,

        // historical
        orders,
        last7: useMemo(() => selectLastNDays(orders, 7), [orders]),
        isLoading,
        error,
        refresh,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => useContext(OrderContext);
