"""
Script para agregar 4 productos con 4 categorías e ingredientes distintos a la DB.
Run with: python add_products.py
"""
import sqlite3
from decimal import Decimal
from datetime import datetime

# Path a la base de datos
DB_PATH = "foodstore.db"

def add_data():
    """Add 4 products with 4 categories and 4 distinct ingredients each."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    
    # 1. Create categories
    categories_data = [
        ("Pizzas", "Pizzas artesanales recién horneadas", 1),
        ("Hamburguesas", "Hamburguesas premium preparadas a la parrilla", 2),
        ("Ensaladas", "Ensaladas saludables y nutritivas", 3),
        ("Pastas", "Pastas italianas preparadas con ingredientes premium", 4),
    ]
    
    category_ids = []
    for name, desc, order in categories_data:
        cursor.execute(
            """INSERT INTO category (name, description, sort_order, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (name, desc, order, True, now, now)
        )
        category_ids.append(cursor.lastrowid)
    
    # 2. Create ingredients
    ingredients_data = [
        ("Tomate", "Tomate fresco de la región", False),
        ("Queso Mozzarella", "Queso mozzarella de alta calidad", False),
        ("Albahaca", "Albahaca fresca aromática", False),
        ("Carne de Res", "Carne de res premium", False),
        ("Lechuga", "Lechuga fresca", False),
        ("Queso Cheddar", "Queso cheddar madurado", False),
        ("Lechuga Romana", "Lechuga romana crujiente", False),
        ("Crutones", "Crutones tostados caseros", False),
        ("Queso Parmesano", "Queso parmesano rallado", False),
        ("Aderezo César", "Aderezo césar casero", False),
        ("Tocino", "Tocino ahumado de calidad", False),
        ("Huevo", "Huevo fresco de granja", False),
        ("Queso Pecorino", "Queso pecorino italiano", False),
        ("Pimienta Negra", "Pimienta negra recién molida", False),
    ]
    
    ingredient_ids = []
    for name, desc, allergen in ingredients_data:
        cursor.execute(
            """INSERT INTO ingredient (name, description, es_alergeno, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)""",
            (name, desc, allergen, now, now)
        )
        ingredient_ids.append(cursor.lastrowid)
    
    # 3. Create products
    products_data = [
        {
            "name": "Pizza Margarita",
            "description": "Deliciosa pizza con tomate, queso mozzarella y albahaca fresca",
            "price": 15.99,
            "stock": 50,
            "image_url": "https://example.com/pizza.jpg",
            "category_idx": 0,
            "ingredient_indices": [0, 1, 2],
        },
        {
            "name": "Hamburguesa Clásica",
            "description": "Hamburguesa con carne de res, lechuga, tomate y cheddar",
            "price": 12.50,
            "stock": 75,
            "image_url": "https://example.com/burger.jpg",
            "category_idx": 1,
            "ingredient_indices": [3, 4, 0, 5],
        },
        {
            "name": "Ensalada César",
            "description": "Ensalada fresca con lechuga romana, croutons, parmesano y aderezo césar",
            "price": 8.99,
            "stock": 40,
            "image_url": "https://example.com/salad.jpg",
            "category_idx": 2,
            "ingredient_indices": [6, 7, 8, 9],
        },
        {
            "name": "Pasta Carbonara",
            "description": "Pasta fresca con tocino, huevo, queso pecorino y pimienta negra",
            "price": 13.75,
            "stock": 60,
            "image_url": "https://example.com/pasta.jpg",
            "category_idx": 3,
            "ingredient_indices": [10, 11, 12, 13],
        },
    ]
    
    for prod_data in products_data:
        cursor.execute(
            """INSERT INTO product (name, description, price, stock, available, image_url, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                prod_data["name"],
                prod_data["description"],
                prod_data["price"],
                prod_data["stock"],
                True,
                prod_data["image_url"],
                now,
                now,
            )
        )
        product_id = cursor.lastrowid
        
        # Add category relationship
        cursor.execute(
            """INSERT INTO productcategory (product_id, category_id)
               VALUES (?, ?)""",
            (product_id, category_ids[prod_data["category_idx"]])
        )
        
        # Add ingredient relationships
        for ing_idx in prod_data["ingredient_indices"]:
            cursor.execute(
                """INSERT INTO productingredient (product_id, ingredient_id)
                   VALUES (?, ?)""",
                (product_id, ingredient_ids[ing_idx])
            )
    
    conn.commit()
    conn.close()
    print("✅ 4 productos con 4 categorías e ingredientes agregados exitosamente!")


if __name__ == "__main__":
    add_data()
