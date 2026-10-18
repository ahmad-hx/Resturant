
function FoodCard({ food, onAddToCart }) {
    return (
        <article className="food-card">
            <div className="food-image">
                🍽️
            </div>

            <div className="food-info">
                <span className="food-category">{food.category}</span>

                <h3>{food.name}</h3>

                <div className="food-bottom">
                    <strong>₹{food.price}</strong>

                    <button
                        type="button"
                        disabled={!food.available}
                        onClick={() => onAddToCart(food)}
                    >
                        {food.available ? "Add +" : "Unavailable"}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default FoodCard;
