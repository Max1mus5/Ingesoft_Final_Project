import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://neondb_owner:npg_8kyL5gfuWiah@ep-sweet-base-a8pzayy7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require')
        rows = await conn.fetch('SELECT id FROM incapacidades;')
        if not rows:
            print('No records found.')
        else:
            ids = [row['id'] for row in rows]
            print(f'Records found: {ids}')
        await conn.close()
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    asyncio.run(main())
