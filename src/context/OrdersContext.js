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

    // NEW: independent state that always holds last 365 days
    const [orders365, setOrders365] = useState([]);
    const [isLoading365, setIsLoading365] = useState(false);
    const [error365, setError365] = useState("");

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

    const loadLast365 = async () => {
        setIsLoading365(true);
        setError365("");
        try {
            const since = new Date(Date.now() - 365 * 86400000); // 365 days ago
            const params = new URLSearchParams();
            params.set("since", since.toISOString());
            params.set("limit", String(5000)); // or whatever cap you want

            const res = await apiReq.get(
                `/order/listOrders?${params.toString()}`
            );

            const list = Array.isArray(res.data) ? res.data : res.data.orders || [];
            setOrders365(list);
            return list;
        } catch (e) {
            setError365(e.message || "Failed to load last 365 days");
            return [];
        } finally {
            setIsLoading365(false);
        }
    };

    // last365 derived from its own state
    const last365Orders = useMemo(
        () => selectLastNDays(orders365, 365),
        [orders365]
    );

    const last365 = {
        orders: last365Orders,
        totalSales: useMemo(
            () =>
                last365Orders.reduce(
                    (sum, o) => sum + (Number(o.price) || 0),
                    0
                ),
            [last365Orders]
        ),
    };

    // auto-load last 30 days on mount (dashboard)
    useEffect(() => {
        const since = new Date(Date.now() - 30 * 86400000);
        refresh({ since, limit: 1000 });
    }, []);

    useEffect(() => {
        loadLast365();  
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

        // dedicated 365 days
        last365,
        loadLast365,
        isLoading365,
        error365,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => useContext(OrderContext);
