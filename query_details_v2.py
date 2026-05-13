import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://neondb_owner:npg_8kyL5gfuWiah@ep-sweet-base-a8pzayy7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require')
        
        incapacidad_id = '790c856d-1205-4cd2-95fb-2fdca7bc6ea3'
        
        # Query incapacidad details
        q1 = f"SELECT * FROM incapacidades WHERE id = '{incapacidad_id}'"
        incapacidad = await conn.fetchrow(q1)
        
        if incapacidad:
            print("--- Incapacidad Details ---")
            for key in incapacidad.keys():
                print(f"{key}: {incapacidad[key]}")
            
            # Query associated soportes_documentales with correct column names
            q2 = f"SELECT tipo_documento, url_archivo FROM soportes_documentales WHERE incapacidad_id = '{incapacidad_id}'"
            soportes = await conn.fetch(q2)
            
            print("\n--- Associated Soportes Documentales ---")
            if soportes:
                for row in soportes:
                    print(f"Tipo: {row['tipo_documento']}, URL: {row['url_archivo']}")
            else:
                print("No associated soportes found.")
        else:
            print(f"Incapacidad record with ID {incapacidad_id} not found.")
            
        await conn.close()
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    asyncio.run(main())
