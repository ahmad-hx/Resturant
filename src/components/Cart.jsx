import { useState } from "react";

function Cart({
    cart,
    onUpdateQuantity,
    onRemove,
    onPlaceOrder,
    placingOrder,
    onContinueShopping
}) {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [formError, setFormError] = useState("");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Check if any cart item has become unavailable
    const unavailableItems = cart.filter((item) => item.available === false);

    function handleSubmitOrder(e) {
        e.preventDefault();
        setFormError("");

        if (cart.length === 0) {
            setFormError("Your cart is empty. Please add items before placing an order.");
            return;
        }

        if (unavailableItems.length > 0) {
            setFormError("Some items in your cart are currently unavailable. Please remove them to proceed.");
            return;
        }

        if (!customerName.trim()) {
            setFormError("Please enter your name.");
            return;
        }

        if (!customerPhone.trim()) {
            setFormError("Please enter your phone number.");
            return;
        }

        onPlaceOrder({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryAddress: deliveryAddress.trim() || "Dine-in / Takeaway"
        });
    }

    return (
        <section className="cart-section">
            <div className="cart-header-row">
                <div>
                    <h2>Your Shopping Cart</h2>
                    <p>{totalItems} item(s) selected</p>
                </div>
                {onContinueShopping && (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onContinueShopping}
                    >
                        ← Continue Ordering
                    </button>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="empty-cart-box">
                    <p className="empty-cart">Your cart is empty.</p>
                    <p>Explore our restaurants and add your favourite dishes!</p>
                    {onContinueShopping && (
                        <button
                            type="button"
                            className="primary-button"
                            onClick={onContinueShopping}
                            style={{ marginTop: "16px" }}
                        >
                            Browse Restaurants
                        </button>
                    )}
                </div>
            ) : (
                <div className="cart-layout">
                    {/* Left Column: Cart Items List */}
                    <div className="cart-items-column">
                        {unavailableItems.length > 0 && (
                            <div className="warning-box">
                                ⚠️ Some items in your cart are marked as unavailable. Please remove them before placing your order.
                            </div>
                        )}

                        <div className="cart-items">
                            {cart.map((item) => (
                                <article
                                    className={`cart-item ${item.available === false ? "cart-item-unavailable" : ""}`}
                                    key={item.id}
                                >
                                    <div className="cart-item-info">
                                        <h3>{item.name}</h3>
                                        {item.restaurantName && (
                                            <span className="cart-item-restaurant">
                                                From: {item.restaurantName}
                                            </span>
                                        )}
                                        <p>₹{item.price} each</p>
                                        {item.available === false && (
                                            <span className="badge-unavailable">Currently Unavailable</span>
                                        )}
                                    </div>

                                    <div className="quantity-controls">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onUpdateQuantity(item.id, item.quantity - 1)
                                            }
                                            aria-label={`Decrease ${item.name} quantity`}
                                        >
                                            −
                                        </button>

                                        <span className="quantity-display">{item.quantity}</span>

                                        <button
                                            type="button"
                                            disabled={item.available === false}
                                            onClick={() =>
                                                onUpdateQuantity(item.id, item.quantity + 1)
                                            }
                                            aria-label={`Increase ${item.name} quantity`}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <strong className="item-subtotal">
                                        ₹{item.price * item.quantity}
                                    </strong>

                                    <button
                                        type="button"
                                        className="remove-item"
                                        onClick={() => onRemove(item.id)}
                                    >
                                        Remove
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Order Summary & Customer Info */}
                    <div className="cart-summary-column">
                        <div className="order-summary-card">
                            <h3>Order Summary</h3>

                            <div className="summary-row">
                                <span>Total Items:</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="summary-row summary-total">
                                <span>Total Amount:</span>
                                <strong>₹{totalPrice}</strong>
                            </div>

                            <form onSubmit={handleSubmitOrder} className="checkout-form">
                                <h4>Customer Details</h4>

                                {formError && <p className="error-message">{formError}</p>}

                                <div className="form-group">
                                    <label htmlFor="customerName">Your Name *</label>
                                    <input
                                        id="customerName"
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="customerPhone">Phone Number *</label>
                                    <input
                                        id="customerPhone"
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deliveryAddress">Delivery Address / Notes</label>
                                    <textarea
                                        id="deliveryAddress"
                                        rows="2"
                                        placeholder="e.g. Hostel Room 204 or Table 5"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="place-order-button"
                                    disabled={placingOrder || cart.length === 0 || unavailableItems.length > 0}
                                >
                                    {placingOrder ? "Placing Order..." : `Place Order (₹${totalPrice})`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Cart;
