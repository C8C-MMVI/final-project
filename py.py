import random
from faker import Faker
from datetime import datetime

fake = Faker()

# -----------------------------
# CONFIG
# -----------------------------
NUM_USERS = 50
NUM_SHOPS = 20
NUM_REPAIR_REQUESTS = 30
NUM_INVENTORY_ITEMS = 50
NUM_TRANSACTIONS = 30
NUM_SALES_ITEMS = 100

roles = ["owner", "technician", "customer"]
statuses = ["active", "inactive"]

device_types = ["Laptop", "Desktop", "Phone", "Tablet", "Printer"]
repair_statuses = ["Pending", "In Progress", "Completed"]
payment_methods = ["Cash", "Credit Card", "Gcash", "PayPal"]
item_categories = ["Electronics", "Accessories", "Parts", "Tools"]

# -----------------------------
# HELPERS
# -----------------------------
def sql_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, str):
        return "'" + val.replace("'", "''") + "'"
    if isinstance(val, datetime):
        return "'" + val.strftime("%Y-%m-%d %H:%M:%S") + "'"
    return str(val)

# -----------------------------
# USERS
# -----------------------------
users = []
for user_id in range(1, NUM_USERS + 1):
    users.append({
        "user_id": user_id,
        "username": fake.user_name()[:50],
        "email": fake.unique.email()[:100],
        "phone": fake.phone_number()[:15],
        "password": fake.password(length=12),
        "role": random.choice(roles),
        "status": random.choice(statuses),
        "created_at": fake.date_time_this_year()
    })

# Ensure required roles exist
users[0]["role"] = "owner"
users[1]["role"] = "technician"
users[2]["role"] = "customer"

# Pre-filter roles
customers = [u for u in users if u["role"] == "customer"]
technicians = [u for u in users if u["role"] == "technician"]
owners = [u for u in users if u["role"] == "owner"]
staff_members = [u for u in users if u["role"] in ["owner", "technician"]]

# -----------------------------
# SHOPS
# -----------------------------
shops = []
for shop_id in range(1, NUM_SHOPS + 1):
    owner = random.choice(owners)
    shops.append({
        "shop_id": shop_id,
        "shop_name": fake.company()[:100],
        "address": fake.address()[:255],
        "contact_number": fake.phone_number()[:20],
        "owner_id": owner["user_id"],
        "created_at": fake.date_time_this_year()
    })

# -----------------------------
# INVENTORY ITEMS
# -----------------------------
inventory_items = []
for item_id in range(1, NUM_INVENTORY_ITEMS + 1):
    shop = random.choice(shops)
    inventory_items.append({
        "item_id": item_id,
        "shop_id": shop["shop_id"],
        "item_name": fake.word().title()[:100],
        "category": random.choice(item_categories),
        "quantity": random.randint(5, 50),
        "price": round(random.uniform(10, 500), 2)
    })

# Ensure every shop has at least one inventory item
for shop in shops:
    shop_items = [i for i in inventory_items if i["shop_id"] == shop["shop_id"]]
    if not shop_items:
        item_id = len(inventory_items) + 1
        inventory_items.append({
            "item_id": item_id,
            "shop_id": shop["shop_id"],
            "item_name": fake.word().title()[:100],
            "category": random.choice(item_categories),
            "quantity": random.randint(5, 50),
            "price": round(random.uniform(10, 500), 2)
        })

# -----------------------------
# REPAIR REQUESTS
# -----------------------------
repair_requests = []
for request_id in range(1, NUM_REPAIR_REQUESTS + 1):
    shop = random.choice(shops)
    repair_requests.append({
        "request_id": request_id,
        "shop_id": shop["shop_id"],
        "customer_id": random.choice(customers)["user_id"],
        "technician_id": random.choice(technicians)["user_id"],
        "device_type": random.choice(device_types),
        "issue_description": fake.text(max_nb_chars=200),
        "media_file": fake.file_name(extension='jpg'),
        "status": random.choice(repair_statuses),
        "technician_notes": fake.text(max_nb_chars=150),
        "created_at": fake.date_time_this_year()
    })

# -----------------------------
# SALES TRANSACTIONS
# -----------------------------
sales_transactions = []
for transaction_id in range(1, NUM_TRANSACTIONS + 1):
    shop = random.choice(shops)
    customer = random.choice(customers)
    staff = random.choice(staff_members)
    sales_transactions.append({
        "transaction_id": transaction_id,
        "shop_id": shop["shop_id"],
        "customer_id": customer["user_id"],
        "staff_id": staff["user_id"],
        "total_amount": 0,
        "payment_method": random.choice(payment_methods),
        "transaction_date": fake.date_time_this_year()
    })

# -----------------------------
# SALES ITEMS
# -----------------------------
sales_items = []
for sales_item_id in range(1, NUM_SALES_ITEMS + 1):
    transaction = random.choice(sales_transactions)
    valid_items = [i for i in inventory_items if i["shop_id"] == transaction["shop_id"]]
    if not valid_items:
        continue  # Skip if somehow no items
    item = random.choice(valid_items)
    quantity = random.randint(1, 5)
    price = round(item["price"] * quantity, 2)
    sales_items.append({
        "sales_item_id": sales_item_id,
        "transaction_id": transaction["transaction_id"],
        "item_id": item["item_id"],
        "quantity": quantity,
        "price": price
    })

# Fix total_amount for transactions
for transaction in sales_transactions:
    total = sum(
        si["price"] for si in sales_items
        if si["transaction_id"] == transaction["transaction_id"]
    )
    transaction["total_amount"] = round(total, 2)

# -----------------------------
# SQL EXPORT
# -----------------------------
with open("./postgres/02_seed_data.sql", "w", encoding="utf-8") as f:

    f.write("BEGIN;\n\n")

    def bulk_insert(table, columns, data):
        f.write(f"INSERT INTO {table} ({', '.join(columns)}) VALUES\n")
        rows = []
        for row in data:
            values = [sql_value(row[col]) for col in columns]
            rows.append(f"({', '.join(values)})")
        f.write(",\n".join(rows))
        f.write(";\n\n")

    # USERS
    bulk_insert("users",
        ["username", "email", "phone", "password", "role", "status", "created_at"],
        users
    )

    # SHOPS
    bulk_insert("shops",
        ["shop_name", "address", "contact_number", "owner_id", "created_at"],
        shops
    )

    # INVENTORY
    bulk_insert("inventory_items",
        ["shop_id", "item_name", "category", "quantity", "price"],
        inventory_items
    )

    # REPAIR REQUESTS
    bulk_insert("repair_requests",
        ["shop_id", "customer_id", "technician_id", "device_type",
         "issue_description", "media_file", "status", "technician_notes", "created_at"],
        repair_requests
    )

    # SALES TRANSACTIONS
    bulk_insert("sales_transactions",
        ["shop_id", "customer_id", "staff_id", "total_amount",
         "payment_method", "transaction_date"],
        sales_transactions
    )

    # SALES ITEMS
    bulk_insert("sales_items",
        ["transaction_id", "item_id", "quantity", "price"],
        sales_items
    )

    f.write("COMMIT;\n")

print("✅ SQL file generated at ./postgres/02_seed_data.sql")