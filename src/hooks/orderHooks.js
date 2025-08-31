import apiReq from "../apiReq";
import {useTables} from "../context/TablesContext";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

const useManageOrder = () => {
    const { socket } = useTables();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);

    const createOrder = async (model, table) => {
        setLoading(true);
        await apiReq.post('/order/newOrder', model)
            .then(async res => {
                setOrder(res.data);
                await apiReq.post('/tables/openTable', {table: table, orderId: res.data._id})
            })
            .then(() => {
                socket.emit('tableChange', 'Table changes: ' + table);
            })
            .finally(() => {
                navigate('/tables')
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
                console.error('Error creating order:', err);
            });
    };

    const updateOrder = async (model, table, orderId) => {
        setLoading(true);
        console.log(orderId)
        await apiReq.put(`/order/editOrder/${orderId}`, model)
            .then(async res => {
                console.log(model)
                console.log('Order updated:', res.data);
                socket.emit('tableChange', 'Table changes: ' + table);
            })
            .finally(() => {
                socket.once('tableChanged', async () => {
                    navigate('/tables')
                    setLoading(false);
                    setError(null);
                });
            })
            .catch(err => {
                setError(err);
                setLoading(false);
                console.error('Error updating order:', err);
            });
    };
    
    return { loading, error, updateOrder, createOrder, order };
};

export { useManageOrder };

