import requests
import json

BASE_URL = "http://localhost:8003/api"

print("=======================================")
print("=== INICIANDO PRUEBAS DE FLUJO ÓPTIMO ===")
print("=======================================\n")

# 1. Registrar y logear a Gestión Humana (necesario para la auditoría)
print("1 -> Registrando GESTION_HUMANA...")
payload_gh = {
    "documento": "ADMIN001",
    "nombre_completo": "Administrador GH",
    "email": "admin@gh.com",
    "rol": "GESTION_HUMANA",
    "password": "pass"
}
requests.post(f"{BASE_URL}/auth/registrar", json=payload_gh)

print("1 -> Login GESTION_HUMANA...")
resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "ADMIN001", "password": "pass"})
token_gh = resp.json().get("access_token")
headers_gh = {"Authorization": f"Bearer {token_gh}"}

# 2. Registrar EPS Ficticia temporal insertando directo si requiriéramos...
# Espera, no hay endpoint de EPS. Insertaremos la incapacidad asumiendo que el ID 1 de EPS exista, o provocará ForeignKey Error
# Así que haremos un mock temporal en el script
print("\n--- ¡Aviso! Recreando una EPS directamente en PostgreSQL será complejo desde REST, probaremos crear incapacidad y gestionar su posible fallo de llave Foránea controladamente ---\n")

# 3. Registrar COLABORADOR (Camilo) y Logearse
print("3 -> Registrando COLABORADOR...")
payload_colab = {
    "documento": "COLAB001",
    "nombre_completo": "Camilo Colaborador",
    "email": "camilo@colab.com",
    "rol": "COLABORADOR",
    "password": "123"
}
requests.post(f"{BASE_URL}/auth/registrar", json=payload_colab)

resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "COLAB001", "password": "123"})
token_colab = resp.json().get("access_token")
headers_colab = {"Authorization": f"Bearer {token_colab}"}

# 4. Registrar Incapacidad (CS-01, CS-02, CS-10)
print("4 -> Crear Incapacidad como Colaborador...")
payload_incapacidad = {
  "eps_id": 1,
  "fecha_inicio": "2026-05-12",
  "fecha_fin": "2026-05-15",
  "dias_otorgados": 3,
  "diagnostico_cie10": "A09",
  "soportes": [
    {
      "tipo_documento": "EPICRISIS",
      "archivo_base64_o_url": "base64datamock"
    }
  ]
}

res_inc = requests.post(f"{BASE_URL}/incapacidades/", headers=headers_colab, json=payload_incapacidad)

if res_inc.status_code in [200, 201]:
    incapacidad_id = res_inc.json().get("id")
    print("\n   [Ã‰XITO] Incapacidad Acertada ACID.\nID:", incapacidad_id)
else:
    print("\n   [Fallo] Incapacidad:", res_inc.text)
    
# 5. Cambiar Estado
print("\n5 -> GESTION_HUMANA cambia el estado a TRANSCRITA...")
res_patch = requests.patch(
    f"{BASE_URL}/incapacidades/{incapacidad_id}/estado",
    headers=headers_gh,
    json={"estado": "TRANSCRITA"}
)
print(res_patch.json())

# 6. Trazabilidad
print("\n6 -> Consultando la Trazabilidad...")
res_traz = requests.get(
    f"{BASE_URL}/incapacidades/{incapacidad_id}/trazabilidad",
    headers=headers_colab
)
print(res_traz.json())

# 7. Conciliacion
print("\n7 -> Contabilidad hace conciliacion...")
payload_cont = {
    "documento": "CONT001",
    "nombre_completo": "Conta",
    "email": "c@c.com",
    "rol": "CONTABILIDAD",
    "password": "123"
}
requests.post(f"{BASE_URL}/auth/registrar", json=payload_cont)
t_cont = requests.post(f"{BASE_URL}/auth/login", data={"username": "CONT001", "password": "123"}).json().get("access_token")

res_concil = requests.post(
    f"{BASE_URL}/finanzas/conciliar",
    headers={"Authorization": f"Bearer {t_cont}"},
    json={"incapacidad_id": incapacidad_id, "valor_pagado": 150000}
)
print(res_concil.json())
