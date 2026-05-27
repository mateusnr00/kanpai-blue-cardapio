export const tags = {
  restaurants: () => "restaurants",
  menu: (restaurantId: string) => `menu:${restaurantId}`,
  category: (restaurantId: string, slug: string) => `cat:${restaurantId}:${slug}`,
  dish: (dishId: string) => `dish:${dishId}`,
  linktree: () => "linktree",
};
