// ─── Menu Categories ──────────────────────────────────────────────────────────
export const menuCategories = ['All', 'Drinks', 'Desserts', 'Snacks'];

// ─── Menu Items ───────────────────────────────────────────────────────────────
export const menuItems = [
  // Snacks
  { id: 1,  name: 'Garlic Bread',        category: 'Snacks', price: 45,  image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=200&h=200&fit=crop', description: 'Toasted ciabatta with herb butter',    popular: false },
  { id: 2,  name: 'Chicken Wings',       category: 'Snacks', price: 89,  image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=200&h=200&fit=crop', description: 'Crispy wings with house sauce',        popular: true  },
  { id: 3,  name: 'Spring Rolls',        category: 'Snacks', price: 65,  image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop', description: 'Vegetable filled, sweet chilli dip',    popular: false },
  { id: 4,  name: 'Soup of the Day',     category: 'Snacks', price: 55,  image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop', description: "Chef's daily homemade soup",            popular: false },

  // Snacks (Main Dishes)
  { id: 5,  name: 'Butter Chicken',      category: 'Snacks', price: 165, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop', description: 'Creamy tomato curry, basmati rice',  popular: true  },
  { id: 6,  name: 'Hyderabadi Biryani',  category: 'Snacks', price: 185, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop', description: 'Slow-cooked fragrant rice dish',      popular: true  },
  { id: 7,  name: 'Grilled Chicken',     category: 'Snacks', price: 145, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=200&h=200&fit=crop', description: 'Herb-marinated, seasonal veg',        popular: false },
  { id: 8,  name: 'Beef Burger',         category: 'Snacks', price: 135, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', description: '200g patty, chips & coleslaw',        popular: true  },
  { id: 9,  name: 'Palak Paneer',        category: 'Snacks', price: 125, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop', description: 'Spinach & cottage cheese curry',      popular: false },
  { id: 10, name: 'Masala Dosa',         category: 'Snacks', price: 95,  image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&h=200&fit=crop', description: 'Crispy crepe, spiced potato fill',    popular: false },

  // Desserts
  { id: 11, name: 'Chocolate Lava Cake', category: 'Desserts', price: 75,  image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop', description: 'Warm cake, vanilla ice cream',        popular: true  },
  { id: 12, name: 'Cheesecake',          category: 'Desserts', price: 65,  image: 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=200&h=200&fit=crop', description: 'New York style, berry compote',       popular: false },
  { id: 13, name: 'Ice Cream',           category: 'Desserts', price: 45,  image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop', description: '3 scoops, choice of flavour',         popular: false },

  // Drinks
  { id: 14, name: 'Mango Lassi',         category: 'Drinks',   price: 45,  image: 'https://images.unsplash.com/photo-1571006682718-f3e43cfda56b?w=200&h=200&fit=crop', description: 'Chilled yoghurt mango blend',         popular: true  },
  { id: 15, name: 'Masala Chai',         category: 'Drinks',   price: 35,  image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=200&h=200&fit=crop', description: 'Spiced Indian milk tea',               popular: false },
  { id: 16, name: 'Fresh Lime Soda',     category: 'Drinks',   price: 30,  image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop', description: 'Sweet or salted, your choice',         popular: false },
  { id: 17, name: 'Mineral Water',       category: 'Drinks',   price: 20,  image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop', description: 'Still or sparkling',                   popular: false },
];

// ─── Dashboard Stats (fallback) ───────────────────────────────────────────────
export const dashboardStats = {
  totalEarnings:  0,
  earningsChange: 0,
  inProgress:     0,
};
