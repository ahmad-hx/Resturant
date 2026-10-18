import { useEffect, useState } from "react";
import { restaurantsAPI, foodsAPI, ordersAPI } from "../services/api";

function Admin({ onRestaurantsUpdated }) {
    const [activeTab, setActiveTab] = useState("restaurants"); // 'restaurants' | 'foods' | 'orders'

    // Data states
    const [restaurants, setRestaurants] = useState([]);
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Restaurant form state
    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        cuisine: "",
        rating: 4.5,
        description: ""
    });
    const [editingRestaurantId, setEditingRestaurantId] = useState(null);

    // Food form state
    const [foodForm, setFoodForm] = useState({
        restaurantId: "",
        name: "",
        category: "",
        price: "",
        available: true
    });
    const [editingFoodId, setEditingFoodId] = useState(null);
    const [foodRestaurantFilter, setFoodRestaurantFilter] = useState("All");

    // Load all data
    async function loadAllData() {
        setLoading(true);
        setError("");
        try {
            const [restData, foodData, orderData] = await Promise.all([
                restaurantsAPI.getAll(),
                foodsAPI.getAll(),
                ordersAPI.getAll()
            ]);
            setRestaurants(restData || []);
            setFoods(foodData || []);
            setOrders(Array.isArray(orderData) ? [...orderData].reverse() : []);

            if (restData && restData.length > 0 && !foodForm.restaurantId) {
                setFoodForm((prev) => ({ ...prev, restaurantId: restData[0].id }));
            }
        } catch (err) {
            setError("Could not load data from JSON Server. Please check if the server is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function fetchInitialData() {
            try {
                const [restData, foodData, orderData] = await Promise.all([
                    restaurantsAPI.getAll(),
                    foodsAPI.getAll(),
                    ordersAPI.getAll()
                ]);
                if (isMounted) {
                    setRestaurants(restData || []);
                    setFoods(foodData || []);
                    setOrders(Array.isArray(orderData) ? [...orderData].reverse() : []);

                    if (restData && restData.length > 0) {
                        setFoodForm((prev) => ({
                            ...prev,
                            restaurantId: prev.restaurantId || restData[0].id
                        }));
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError("Could not load data from JSON Server. Please check if the server is running.");
                    console.error(err);
                }
            }
        }

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    function showFeedback(msg) {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3500);
    }

    // ==========================================
    // RESTAURANT CRUD OPERATIONS
    // ==========================================

    async function handleRestaurantSubmit(e) {
        e.preventDefault();
        setError("");

        if (!restaurantForm.name || !restaurantForm.cuisine) {
            alert("Please fill in Restaurant Name and Cuisine.");
            return;
        }

        try {
            if (editingRestaurantId) {
                // PUT: Update existing restaurant
                const updated = await restaurantsAPI.update(editingRestaurantId, {
                    ...restaurantForm,
                    rating: parseFloat(restaurantForm.rating) || 4.0
                });
                setRestaurants((prev) =>
                    prev.map((r) => (r.id === editingRestaurantId ? updated : r))
                );
                showFeedback(`Restaurant "${updated.name}" updated successfully!`);
                setEditingRestaurantId(null);
            } else {
                // POST: Create new restaurant
                const newRestaurant = {
                    id: String(Date.now()),
                    ...restaurantForm,
                    rating: parseFloat(restaurantForm.rating) || 4.0
                };
                const created = await restaurantsAPI.create(newRestaurant);
                setRestaurants((prev) => [...prev, created]);
                showFeedback(`Restaurant "${created.name}" created successfully!`);
            }

            // Reset form
            setRestaurantForm({
                name: "",
                cuisine: "",
                rating: 4.5,
                description: ""
            });

            // Notify parent app to refresh restaurant listing
            if (onRestaurantsUpdated) onRestaurantsUpdated();
        } catch (err) {
            setError("Failed to save restaurant. Try again.");
            console.error(err);
        }
    }

    function startEditRestaurant(restaurant) {
        setEditingRestaurantId(restaurant.id);
        setRestaurantForm({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            description: restaurant.description || ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEditRestaurant() {
        setEditingRestaurantId(null);
        setRestaurantForm({
            name: "",
            cuisine: "",
            rating: 4.5,
            description: ""
        });
    }

    async function handleDeleteRestaurant(id, name) {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await restaurantsAPI.remove(id);
            setRestaurants((prev) => prev.filter((r) => r.id !== id));
            showFeedback(`Restaurant "${name}" deleted.`);
            if (onRestaurantsUpdated) onRestaurantsUpdated();
        } catch (err) {
            setError("Failed to delete restaurant.");
            console.error(err);
        }
    }

    // ==========================================
    // FOOD CRUD OPERATIONS
    // ==========================================

    async function handleFoodSubmit(e) {
        e.preventDefault();
        setError("");

        if (!foodForm.restaurantId || !foodForm.name || !foodForm.price) {
            alert("Please fill in Restaurant, Food Name, and Price.");
            return;
        }

        try {
            if (editingFoodId) {
                // PUT: Update food item
                const updated = await foodsAPI.update(editingFoodId, {
                    ...foodForm,
                    price: parseFloat(foodForm.price),
                    available: Boolean(foodForm.available)
                });
                setFoods((prev) =>
                    prev.map((f) => (f.id === editingFoodId ? updated : f))
                );
                showFeedback(`Food item "${updated.name}" updated successfully!`);
                setEditingFoodId(null);
            } else {
                // POST: Create food item
                const newFood = {
                    id: String(Date.now()),
                    restaurantId: String(foodForm.restaurantId),
                    name: foodForm.name,
                    category: foodForm.category || "General",
                    price: parseFloat(foodForm.price),
                    available: Boolean(foodForm.available)
                };
                const created = await foodsAPI.create(newFood);
                setFoods((prev) => [...prev, created]);
                showFeedback(`Food item "${created.name}" created successfully!`);
            }

            // Reset form
            setFoodForm({
                restaurantId: restaurants[0]?.id || "",
                name: "",
                category: "",
                price: "",
                available: true
            });
        } catch (err) {
            setError("Failed to save food item. Try again.");
            console.error(err);
        }
    }

    function startEditFood(food) {
        setEditingFoodId(food.id);
        setFoodForm({
            restaurantId: food.restaurantId,
            name: food.name,
            category: food.category,
            price: food.price,
            available: food.available
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEditFood() {
        setEditingFoodId(null);
        setFoodForm({
            restaurantId: restaurants[0]?.id || "",
            name: "",
            category: "",
            price: "",
            available: true
        });
    }

    async function handleToggleFoodAvailability(food) {
        try {
            const updated = { ...food, available: !food.available };
            await foodsAPI.update(food.id, updated);
            setFoods((prev) => prev.map((f) => (f.id === food.id ? updated : f)));
            showFeedback(`"${food.name}" availability changed to ${updated.available ? "Available" : "Unavailable"}`);
        } catch (err) {
            setError("Failed to update availability.");
            console.error(err);
        }
    }

    async function handleDeleteFood(id, name) {
        if (!window.confirm(`Are you sure you want to delete food item "${name}"?`)) return;

        try {
            await foodsAPI.remove(id);
            setFoods((prev) => prev.filter((f) => f.id !== id));
            showFeedback(`Food item "${name}" deleted.`);
        } catch (err) {
            setError("Failed to delete food item.");
            console.error(err);
        }
    }

    // ==========================================
    // ORDER MANAGEMENT (PUT Status & DELETE)
    // ==========================================

    async function handleOrderStatusChange(orderId, newStatus) {
        try {
            const existingOrder = orders.find((o) => o.id === orderId);
            if (!existingOrder) return;

            const updatedOrder = { ...existingOrder, status: newStatus };
            await ordersAPI.update(orderId, updatedOrder);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? updatedOrder : o))
            );
            showFeedback(`Order #${orderId} status updated to "${newStatus}"`);
        } catch (err) {
            setError("Failed to update order status.");
            console.error(err);
        }
    }

    async function handleDeleteOrder(orderId) {
        if (!window.confirm(`Are you sure you want to delete Order #${orderId}?`)) return;

        try {
            await ordersAPI.remove(orderId);
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            showFeedback(`Order #${orderId} deleted.`);
        } catch (err) {
            setError("Failed to delete order.");
            console.error(err);
        }
    }

    // Filter foods for display
    const displayedFoods = foodRestaurantFilter === "All"
        ? foods
        : foods.filter((f) => String(f.restaurantId) === String(foodRestaurantFilter));

    // Helper to get restaurant name by ID
    function getRestaurantName(id) {
        const found = restaurants.find((r) => String(r.id) === String(id));
        return found ? found.name : `Restaurant #${id}`;
    }

    return (
        <main className="app admin-page">
            <header className="admin-header">
                <div>
                    <h1>⚙️ Admin Dashboard</h1>
                    <p>Manage restaurants, food menus, and customer orders in one place.</p>
                </div>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadAllData}
                    disabled={loading}
                >
                    🔄 Refresh Data
                </button>
            </header>

            {message && <div className="success-banner">{message}</div>}
            {error && <div className="error-banner">{error}</div>}

            {/* Navigation Tabs */}
            <div className="admin-tabs">
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "restaurants" ? "active" : ""}`}
                    onClick={() => setActiveTab("restaurants")}
                >
                    🍴 Restaurants ({restaurants.length})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "foods" ? "active" : ""}`}
                    onClick={() => setActiveTab("foods")}
                >
                    🍔 Food Items ({foods.length})
                </button>
                <button
                    type="button"
                    className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
                    onClick={() => setActiveTab("orders")}
                >
                    📦 Orders ({orders.length})
                </button>
            </div>

            {loading && <p className="loading-text">Loading admin data...</p>}

            {/* ==================================================== */}
            {/* TAB 1: RESTAURANTS                                    */}
            {/* ==================================================== */}
            {!loading && activeTab === "restaurants" && (
                <section className="admin-section">
                    <div className="admin-form-card">
                        <h3>{editingRestaurantId ? "✏️ Edit Restaurant" : "➕ Add New Restaurant"}</h3>
                        <form onSubmit={handleRestaurantSubmit} className="admin-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Restaurant Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Royal Biryani Hub"
                                        value={restaurantForm.name}
                                        onChange={(e) =>
                                            setRestaurantForm({ ...restaurantForm, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Cuisine Type *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Indian, Chinese, Italian"
                                        value={restaurantForm.cuisine}
                                        onChange={(e) =>
                                            setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Rating (1.0 - 5.0) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        value={restaurantForm.rating}
                                        onChange={(e) =>
                                            setRestaurantForm({ ...restaurantForm, rating: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Traditional clay pot cooked biryanis and kebabs"
                                        value={restaurantForm.description}
                                        onChange={(e) =>
                                            setRestaurantForm({ ...restaurantForm, description: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-buttons">
                                <button type="submit" className="primary-button">
                                    {editingRestaurantId ? "Save Changes" : "Add Restaurant"}
                                </button>
                                {editingRestaurantId && (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={cancelEditRestaurant}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="admin-table-container">
                        <h3>Existing Restaurants ({restaurants.length})</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Cuisine</th>
                                    <th>Rating</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map((r) => (
                                    <tr key={r.id}>
                                        <td><code>#{r.id}</code></td>
                                        <td><strong>{r.name}</strong></td>
                                        <td>{r.cuisine}</td>
                                        <td>★ {r.rating}</td>
                                        <td className="description-cell">{r.description}</td>
                                        <td className="actions-cell">
                                            <button
                                                type="button"
                                                className="edit-button"
                                                onClick={() => startEditRestaurant(r)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => handleDeleteRestaurant(r.id, r.name)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ==================================================== */}
            {/* TAB 2: FOOD ITEMS                                     */}
            {/* ==================================================== */}
            {!loading && activeTab === "foods" && (
                <section className="admin-section">
                    <div className="admin-form-card">
                        <h3>{editingFoodId ? "✏️ Edit Food Item" : "➕ Add New Food Item"}</h3>
                        <form onSubmit={handleFoodSubmit} className="admin-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Restaurant *</label>
                                    <select
                                        value={foodForm.restaurantId}
                                        onChange={(e) =>
                                            setFoodForm({ ...foodForm, restaurantId: e.target.value })
                                        }
                                        required
                                    >
                                        <option value="">Select Restaurant</option>
                                        {restaurants.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Food Item Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Paneer Tikka"
                                        value={foodForm.name}
                                        onChange={(e) =>
                                            setFoodForm({ ...foodForm, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Starter, Main Course, Pizza"
                                        value={foodForm.category}
                                        onChange={(e) =>
                                            setFoodForm({ ...foodForm, category: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 199"
                                        value={foodForm.price}
                                        onChange={(e) =>
                                            setFoodForm({ ...foodForm, price: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={foodForm.available}
                                            onChange={(e) =>
                                                setFoodForm({ ...foodForm, available: e.target.checked })
                                            }
                                        />
                                        <span>Available for Ordering</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-buttons">
                                <button type="submit" className="primary-button">
                                    {editingFoodId ? "Save Changes" : "Add Food Item"}
                                </button>
                                {editingFoodId && (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={cancelEditFood}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="admin-table-container">
                        <div className="table-header-flex">
                            <h3>Food Items ({displayedFoods.length})</h3>
                            <div className="filter-group">
                                <label>Filter by Restaurant: </label>
                                <select
                                    value={foodRestaurantFilter}
                                    onChange={(e) => setFoodRestaurantFilter(e.target.value)}
                                >
                                    <option value="All">All Restaurants</option>
                                    {restaurants.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Restaurant</th>
                                    <th>Food Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Availability</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedFoods.map((f) => (
                                    <tr key={f.id}>
                                        <td><code>#{f.id}</code></td>
                                        <td>{getRestaurantName(f.restaurantId)}</td>
                                        <td><strong>{f.name}</strong></td>
                                        <td>{f.category}</td>
                                        <td>₹{f.price}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`toggle-avail-button ${f.available ? "is-available" : "is-unavailable"}`}
                                                onClick={() => handleToggleFoodAvailability(f)}
                                                title="Click to toggle availability"
                                            >
                                                {f.available ? "✅ Available" : "❌ Unavailable"}
                                            </button>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                type="button"
                                                className="edit-button"
                                                onClick={() => startEditFood(f)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => handleDeleteFood(f.id, f.name)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ==================================================== */}
            {/* TAB 3: ORDERS                                         */}
            {/* ==================================================== */}
            {!loading && activeTab === "orders" && (
                <section className="admin-section">
                    <div className="admin-table-container">
                        <h3>Customer Orders ({orders.length})</h3>
                        {orders.length === 0 ? (
                            <p className="empty-text">No customer orders placed yet.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Restaurant</th>
                                        <th>Items Summary</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                        <th>Status (Update)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id}>
                                            <td><code>#{o.id}</code></td>
                                            <td>
                                                <strong>{o.customerName || "Customer"}</strong>
                                                <div className="small-text">{o.customerPhone}</div>
                                                {o.deliveryAddress && (
                                                    <div className="small-text text-muted">{o.deliveryAddress}</div>
                                                )}
                                            </td>
                                            <td>{o.restaurantName || "Restaurant"}</td>
                                            <td>
                                                <div className="items-summary-list">
                                                    {o.items?.map((item, idx) => (
                                                        <div key={idx} className="items-summary-line">
                                                            {item.name} × {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td><strong>₹{o.totalAmount}</strong></td>
                                            <td className="small-text">{o.date}</td>
                                            <td>
                                                <select
                                                    className={`status-select status-${(o.status || "placed").toLowerCase()}`}
                                                    value={o.status || "Placed"}
                                                    onChange={(e) =>
                                                        handleOrderStatusChange(o.id, e.target.value)
                                                    }
                                                >
                                                    <option value="Placed">Placed</option>
                                                    <option value="Preparing">Preparing</option>
                                                    <option value="Ready">Ready</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() => handleDeleteOrder(o.id)}
                                                    title="Delete Order record"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            )}
        </main>
    );
}

export default Admin;
