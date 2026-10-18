function RestaurantCard({ restaurant }) {
  return (
    <article className="restaurant-card">
      <div className="restaurant-image">
        {restaurant.name.charAt(0)}
      </div>

      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p>{restaurant.description}</p>

        <div className="restaurant-footer">
          <span>{restaurant.cuisine}</span>
          <span>★ {restaurant.rating}</span>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
