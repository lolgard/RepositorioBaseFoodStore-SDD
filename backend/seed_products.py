import asyncio
from decimal import Decimal
from sqlmodel import select

from app.core.database import async_session
from app.models.category import Category
from app.models.ingredient import Ingredient
from app.models.product import Product, ProductCategory, ProductIngredient

async def seed():
    async with async_session() as session:
        # Prevent duplicate seeding
        existing = await session.exec(select(Product).where(Product.name == "Cheeseburger Bacon"))
        if existing.first():
            print("Database already seeded with demo products.")
            return

        print("Seeding demo products...")
        # Create Categories
        burger_cat = Category(name="Hamburguesas", description="Hamburguesas caseras 100% carne", is_active=True, sort_order=1)
        drink_cat = Category(name="Bebidas", description="Bebidas frías y gaseosas", is_active=True, sort_order=2)
        dessert_cat = Category(name="Postres", description="Dulces para terminar", is_active=True, sort_order=3)
        
        session.add_all([burger_cat, drink_cat, dessert_cat])
        await session.commit()
        await session.refresh(burger_cat)
        await session.refresh(drink_cat)
        
        # Create Ingredients
        ing_cheddar = Ingredient(name="Queso Cheddar", is_active=True)
        ing_bacon = Ingredient(name="Panceta", is_active=True)
        ing_meat = Ingredient(name="Medallón de Carne (180g)", is_active=True)
        ing_bun = Ingredient(name="Pan de Papa", is_active=True)
        
        session.add_all([ing_cheddar, ing_bacon, ing_meat, ing_bun])
        await session.commit()
        await session.refresh(ing_cheddar)
        await session.refresh(ing_bacon)
        await session.refresh(ing_meat)
        await session.refresh(ing_bun)

        # Create Products
        p1 = Product(
            name="Cheeseburger Bacon",
            description="Doble medallón de carne, triple cheddar, panceta crocante y pan de papa artesanal.",
            price=Decimal("15000.00"),
            stock=50,
            available=True,
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1599&auto=format&fit=crop"
        )
        
        p2 = Product(
            name="Hamburguesa Clásica",
            description="Medallón de carne 180g, lechuga, tomate y queso cheddar.",
            price=Decimal("11000.00"),
            stock=100,
            available=True,
            image_url="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1480&auto=format&fit=crop"
        )
        
        p3 = Product(
            name="Coca-Cola 500ml",
            description="Gaseosa sabor original fría.",
            price=Decimal("2500.00"),
            stock=200,
            available=True,
            image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1470&auto=format&fit=crop"
        )

        p4 = Product(
            name="Papas Fritas Cheddar y Bacon",
            description="Papas fritas crujientes con salsa cheddar y lluvia de panceta crocante.",
            price=Decimal("7500.00"),
            stock=150,
            available=True,
            image_url="https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1470&auto=format&fit=crop"
        )

        session.add_all([p1, p2, p3, p4])
        await session.commit()
        await session.refresh(p1)
        await session.refresh(p2)
        await session.refresh(p3)
        await session.refresh(p4)

        # Associations
        session.add(ProductCategory(product_id=p1.id, category_id=burger_cat.id))
        session.add(ProductCategory(product_id=p2.id, category_id=burger_cat.id))
        session.add(ProductCategory(product_id=p3.id, category_id=drink_cat.id))
        # assume papas can go into starters or we just don't set a category for now, or put it in burger cat temporarily
        session.add(ProductCategory(product_id=p4.id, category_id=burger_cat.id))
        
        session.add(ProductIngredient(product_id=p1.id, ingredient_id=ing_bun.id))
        session.add(ProductIngredient(product_id=p1.id, ingredient_id=ing_meat.id))
        session.add(ProductIngredient(product_id=p1.id, ingredient_id=ing_cheddar.id))
        session.add(ProductIngredient(product_id=p1.id, ingredient_id=ing_bacon.id))

        await session.commit()
        print("Productos, categorias e ingredientes insertados correctamente!")

if __name__ == "__main__":
    asyncio.run(seed())
