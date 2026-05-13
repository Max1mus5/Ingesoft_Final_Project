import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://neondb_owner:npg_8kyL5gfuWiah@ep-sweet-base-a8pzayy7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require')
        
        # Check columns in soportes_documentales
        columns = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'soportes_documentales'")
        print("--- Columns in soportes_documentales ---")
        for col in columns:
            print(col['column_name'])
            
        await conn.close()
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    asyncio.run(main())
