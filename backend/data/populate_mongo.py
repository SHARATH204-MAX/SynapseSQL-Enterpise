from pymongo import MongoClient

# 1. Update this if you are using MongoDB Atlas, otherwise leave as localhost
MONGO_URI = "mongodb://localhost:27017/" 
DATABASE_NAME = "test_store"

def populate_database():
    print(f"Connecting to MongoDB at: {MONGO_URI}")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Force a connection check
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        db = client[DATABASE_NAME]
        collection = db["products"]
        
        # Clear existing data if you run this multiple times
        collection.delete_many({})
        
        # Sample Dataset
        sample_products = [
            {"name": "Laptop Pro", "category": "Electronics", "price": 1200, "stock": 45},
            {"name": "Wireless Mouse", "category": "Electronics", "price": 25, "stock": 150},
            {"name": "Ergonomic Chair", "category": "Furniture", "price": 250, "stock": 20},
            {"name": "Desk Lamp", "category": "Furniture", "price": 45, "stock": 80},
            {"name": "Coffee Maker", "category": "Appliances", "price": 99, "stock": 30}
        ]
        
        # Insert data
        result = collection.insert_many(sample_products)
        print(f"✅ Successfully inserted {len(result.inserted_ids)} records into the '{DATABASE_NAME}.products' collection.")
        
    except Exception as e:
        print(f"❌ Connection or Insertion Failed: {e}")

if __name__ == "__main__":
    populate_database()
