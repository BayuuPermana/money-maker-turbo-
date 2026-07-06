import psycopg2

passwords = ["postgres", "", "admin", "root", "123456"]
connected = False

for pwd in passwords:
    try:
        print(f"Trying connection with user='postgres' and password='{pwd}'...")
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password=pwd,
            host="localhost",
            port=5432
        )
        print(f"Success! Connected to PostgreSQL with password: '{pwd}'")
        conn.close()
        connected = True
        break
    except Exception as e:
        print(f"Failed with password '{pwd}': {e}")

if not connected:
    print("Could not connect with default postgres user credentials.")
