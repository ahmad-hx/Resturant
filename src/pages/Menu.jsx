
import { useEffect, useState } from "react";
import { foodsAPI } from "../services/api";
import FoodCard from "../components/FoodCard";

function Menu({ restaurant, onBack, onAddToCart, onViewCart, cartCount = 0 }) {
    const [foods, setFoods] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFoods() {
            try {
                const data = await foodsAPI.getAll();

                const restaurantFoods = data.filter(
                    (food) =>
                        String(food.restaurantId) === String(restaurant.id)
                );

                setFoods(restaurantFoods);
            } catch (err) {
                setError("Unable to load the food menu.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadFoods();
    }, [restaurant.id]);

    const categories = [
        "All",
        ...new Set(foods.map((food) => food.category))
    ];

    const filteredFoods = foods.filter((food) => {
        const matchesSearch = food.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            category === "All" || food.category === category;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="app">
            <div className="menu-top-actions">
                <button className="back-button" onClick={onBack}>
                    ← Back to Restaurants
                </button>
                {onViewCart && cartCount > 0 && (
                    <button className="cart-shortcut-button" onClick={onViewCart}>
                        🛒 View Cart ({cartCount}) →
                    </button>
                )}
            </div>

            <header className="menu-hero">
                <p className="eyebrow">{restaurant.cuisine} CUISINE</p>
                <h1>{restaurant.name}</h1>
                <p>{restaurant.description}</p>
                <span>★ {restaurant.rating}</span>
            </header>

            <section className="menu-section">
                <h2>Explore the Menu</h2>

                <input
                    className="search-input"
                    type="text"
                    placeholder="Search food items..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <div className="category-list">
                    {categories.map((item) => (
                        <button
                            key={item}
                            className={
                                category === item
                                    ? "category-button active"
                                    : "category-button"
                            }
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {loading && <p>Loading menu...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && filteredFoods.length === 0 && (
                    <p>No matching food items found.</p>
                )}

                {!loading && !error && (
                    <div className="food-grid">
                        {filteredFoods.map((food) => (
                            <FoodCard
                                key={food.id}
                                food={food}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Menu;
