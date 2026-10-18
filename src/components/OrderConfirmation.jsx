function OrderConfirmation({ order, onViewOrders, onContinueShopping }) {
    if (!order) return null;

    return (
        <section className="confirmation-section">
            <div className="confirmation-card">
                <div className="confirmation-icon">🎉</div>
                <h2>Order Placed Successfully!</h2>
                <p className="confirmation-subtitle">
                    Thank you, <strong>{order.customerName}</strong>! Your order has been placed with the restaurant.
                </p>

                <div className="confirmation-details">
                    <div className="detail-row">
                        <span className="detail-label">Order ID:</span>
                        <span className="detail-value order-id">#{order.id}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Restaurant:</span>
                        <span className="detail-value">{order.restaurantName || "Restaurant"}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">{order.date}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{order.customerPhone}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Delivery Note:</span>
                        <span className="detail-value">{order.deliveryAddress}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className="status-badge status-placed">{order.status}</span>
                    </div>
                </div>

                <div className="confirmation-items">
                    <h4>Items Ordered ({order.items?.length || 0})</h4>
                    <ul>
                        {order.items?.map((item, idx) => (
                            <li key={idx} className="confirmation-item-row">
                                <span>{item.name} × {item.quantity}</span>
                                <strong>₹{item.price * item.quantity}</strong>
                            </li>
                        ))}
                    </ul>
                    <div className="confirmation-total-row">
                        <span>Total Paid:</span>
                        <strong>₹{order.totalAmount}</strong>
                    </div>
                </div>

                <div className="confirmation-actions">
                    <button
                        type="button"
                        className="primary-button"
                        onClick={onViewOrders}
                    >
                        📦 View in My Orders
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onContinueShopping}
                    >
                        🍽️ Order More Food
                    </button>
                </div>
            </div>
        </section>
    );
}

export default OrderConfirmation;
