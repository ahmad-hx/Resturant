import { useEffect, useState } from "react";
import { restaurantsAPI, ordersAPI } from "./services/api";
import RestaurantCard from "./components/RestaurantCard";
import Cart from "./components/Cart";
import OrderConfirmation from "./components/OrderConfirmation";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  // Navigation & View state: 'restaurants' | 'cart' | 'orders' | 'admin' | 'confirmation'
  const [currentView, setCurrentView] = useState("restaurants");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Data states
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load restaurants
  async function loadRestaurants() {
    setLoading(true);
    setError("");
    try {
      const data = await restaurantsAPI.getAll();
      setRestaurants(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load restaurants. Please ensure the backend server is running.");
      console.error("Failed to load restaurants:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const data = await restaurantsAPI.getAll();
        if (isMounted) {
          setRestaurants(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Could not load restaurants. Please ensure the backend server is running.");
          console.error("Failed to load restaurants on mount:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Total item count in cart for header badge
  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ==========================================
  // CART ACTIONS
  // ==========================================

  function addToCart(food) {
    if (!food.available) {
      alert("This item is currently unavailable and cannot be added.");
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          String(item.id) === String(food.id) &&
          String(item.restaurantId) === String(food.restaurantId)
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === food.id && item.restaurantId === food.restaurantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Include restaurant name for clear order record
      const restaurantName =
        selectedRestaurant?.name || food.restaurantName || "Restaurant";

      return [...currentCart, { ...food, restaurantName, quantity: 1 }];
    });
  }

  function updateCartQuantity(foodId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === foodId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  function removeFromCart(foodId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== foodId)
    );
  }

  // ==========================================
  // ORDER PLACEMENT ACTION
  // ==========================================

  async function handlePlaceOrder(customerDetails) {
    if (cart.length === 0) return;

    setPlacingOrder(true);
    try {
      // Build order record matching requirements
      const primaryRestaurantName =
        selectedRestaurant?.name || cart[0]?.restaurantName || "Partner Restaurant";

      const newOrder = {
        id: String(Date.now()),
        restaurantName: primaryRestaurantName,
        customerName: customerDetails.customerName,
        customerPhone: customerDetails.customerPhone,
        deliveryAddress: customerDetails.deliveryAddress,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toLocaleString(),
        status: "Placed"
      };

      // POST order to JSON Server via ordersAPI
      const savedOrder = await ordersAPI.create(newOrder);

      // Clear cart & display confirmation screen
      setCart([]);
      setPlacedOrder(savedOrder);
      setCurrentView("confirmation");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please check that the backend server is running.");
    } finally {
      setPlacingOrder(false);
    }
  }

  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================

  function navigateTo(view) {
    setCurrentView(view);
    if (view === "restaurants") {
      setSelectedRestaurant(null);
    }
  }

  function handleSelectRestaurant(restaurant) {
    setSelectedRestaurant(restaurant);
    setCurrentView("restaurants");
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div
          className="brand-logo"
          onClick={() => navigateTo("restaurants")}
          title="Restaurant Portal Home"
        >
          🍴 Restaurant Portal
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-button ${currentView === "restaurants" ? "active" : ""}`}
            onClick={() => navigateTo("restaurants")}
          >
            🍽️ Restaurants
          </button>

          <button
            type="button"
            className={`nav-button ${currentView === "cart" ? "active" : ""}`}
            onClick={() => navigateTo("cart")}
          >
            🛒 Cart ({totalCartCount})
          </button>

          <button
            type="button"
            className={`nav-button ${currentView === "orders" ? "active" : ""}`}
            onClick={() => navigateTo("orders")}
          >
            📦 My Orders
          </button>

          <button
            type="button"
            className={`nav-button nav-admin ${currentView === "admin" ? "active" : ""}`}
            onClick={() => navigateTo("admin")}
          >
            ⚙️ Admin
          </button>
        </nav>
      </header>

      {/* VIEW: ORDER CONFIRMATION */}
      {currentView === "confirmation" && placedOrder && (
        <OrderConfirmation
          order={placedOrder}
          onViewOrders={() => navigateTo("orders")}
          onContinueShopping={() => navigateTo("restaurants")}
        />
      )}

      {/* VIEW: SHOPPING CART */}
      {currentView === "cart" && (
        <main className="app">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
            placingOrder={placingOrder}
            onContinueShopping={() => {
              if (selectedRestaurant) {
                setCurrentView("restaurants");
              } else {
                navigateTo("restaurants");
              }
            }}
          />
        </main>
      )}

      {/* VIEW: MY ORDERS */}
      {currentView === "orders" && (
        <Orders onBrowseRestaurants={() => navigateTo("restaurants")} />
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {currentView === "admin" && (
        <Admin onRestaurantsUpdated={loadRestaurants} />
      )}

      {/* VIEW: RESTAURANT MENU */}
      {currentView === "restaurants" && selectedRestaurant && (
        <Menu
          restaurant={selectedRestaurant}
          onBack={() => setSelectedRestaurant(null)}
          onAddToCart={addToCart}
          onViewCart={() => navigateTo("cart")}
          cartCount={totalCartCount}
        />
      )}

      {/* VIEW: RESTAURANT LISTING (Home) */}
      {currentView === "restaurants" && !selectedRestaurant && (
        <main className="app">
          <header className="hero">
            <p className="eyebrow">GOOD FOOD, GOOD MOOD</p>
            <h1>Discover your next favourite meal.</h1>
            <p>
              Explore top-rated restaurants, browse menus, and order your favourite dishes online.
            </p>
          </header>

          <section className="restaurants-section">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">EXPLORE</p>
                <h2>Restaurants near you</h2>
              </div>
              {!loading && !error && (
                <span className="restaurant-count-badge">
                  {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} available
                </span>
              )}
            </div>

            {loading && <p className="loading-text">Loading restaurants from server...</p>}
            {error && (
              <div className="error-box">
                <p className="error">{error}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={loadRestaurants}
                  style={{ marginTop: "8px" }}
                >
                  🔄 Retry Connection
                </button>
              </div>
            )}

            {!loading && !error && restaurants.length === 0 && (
              <p className="empty-text">No restaurants available yet. Use Admin Dashboard to add some.</p>
            )}

            {!loading && !error && (
              <div className="restaurant-grid">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="restaurant-card-wrapper">
                    <RestaurantCard restaurant={restaurant} />
                    <button
                      className="open-menu-button"
                      onClick={() => handleSelectRestaurant(restaurant)}
                    >
                      View Menu →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </>
  );
}

export default App;
