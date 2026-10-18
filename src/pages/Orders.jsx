import { useEffect, useState } from "react";
import { ordersAPI } from "../services/api";

function Orders({ onBrowseRestaurants }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    async function loadOrders() {
        setLoading(true);
        setError("");
        try {
            const data = await ordersAPI.getAll();
            const sorted = Array.isArray(data)
                ? [...data].reverse()
                : [];
            setOrders(sorted);
        } catch (err) {
            setError("Unable to load orders. Please make sure JSON Server is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function fetchInitialOrders() {
            try {
                const data = await ordersAPI.getAll();
                if (isMounted) {
                    const sorted = Array.isArray(data) ? [...data].reverse() : [];
                    setOrders(sorted);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Unable to load orders. Please make sure JSON Server is running.");
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchInitialOrders();

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleCancelOrder(order) {
        const confirmCancel = window.confirm(
            `Are you sure you want to cancel Order #${order.id}?`
        );
        if (!confirmCancel) return;

        setUpdatingId(order.id);
        try {
            const updatedOrder = { ...order, status: "Cancelled" };
            await ordersAPI.update(order.id, updatedOrder);
            // Update local state
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? updatedOrder : o))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to cancel order. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    }

    // Helper for status badge styling
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case "placed":
                return "status-placed";
            case "preparing":
                return "status-preparing";
            case "ready":
                return "status-ready";
            case "delivered":
                return "status-delivered";
            case "cancelled":
                return "status-cancelled";
            default:
                return "status-default";
        }
    }

    return (
        <main className="app">
            <div className="orders-header">
                <div>
                    <h1>My Orders</h1>
                    <p>Track the status of your current and past meal orders.</p>
                </div>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadOrders}
                    disabled={loading}
                >
                    🔄 Refresh Status
                </button>
            </div>

            {loading && <p className="loading-text">Loading orders from server...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && orders.length === 0 && (
                <div className="empty-box">
                    <p className="empty-title">No orders found.</p>
                    <p>You haven't placed any orders yet. Discover delicious food now!</p>
                    {onBrowseRestaurants && (
                        <button
                            type="button"
                            className="primary-button"
                            onClick={onBrowseRestaurants}
                            style={{ marginTop: "16px" }}
                        >
                            Browse Restaurants
                        </button>
                    )}
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article key={order.id} className="order-card">
                            <div className="order-card-top">
                                <div>
                                    <span className="order-card-id">Order #{order.id}</span>
                                    <span className="order-card-date">Placed on {order.date}</span>
                                </div>
                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-card-body">
                                <div className="order-restaurant-info">
                                    <h3>🍴 {order.restaurantName || "Restaurant"}</h3>
                                    {order.customerName && (
                                        <p className="order-customer-note">
                                            Ordered by: <strong>{order.customerName}</strong> ({order.customerPhone})
                                        </p>
                                    )}
                                    {order.deliveryAddress && (
                                        <p className="order-customer-note">
                                            Note: {order.deliveryAddress}
                                        </p>
                                    )}
                                </div>

                                <div className="order-items-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <div className="order-total-block">
                                    <span>Total Amount:</span>
                                    <strong>₹{order.totalAmount}</strong>
                                </div>

                                {order.status === "Placed" && (
                                    <button
                                        type="button"
                                        className="cancel-order-button"
                                        disabled={updatingId === order.id}
                                        onClick={() => handleCancelOrder(order)}
                                    >
                                        {updatingId === order.id ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Orders;
