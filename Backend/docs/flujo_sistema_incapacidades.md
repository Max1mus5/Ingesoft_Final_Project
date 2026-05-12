# Flujo Óptimo del Sistema Integral de Gestión de Incapacidades y Recobros

Este documento expone la estructura, los casos de uso principales y el ciclo de vida del sistema de incapacidades, fundamentado en el **Documento de Visión y Alcance** (Versión 1.0) y diseñado bajo el estándar REST.

## 1. Visión General del Sistema
El sistema centraliza el 100% de los registros y soportes de incapacidades (OB-01). Elimina la dependencia de documentos físicos y mejora la comunicación entre el Colaborador, Gestión Humana y Contabilidad. El sistema reduce a cero el riesgo de pérdida económica por extemporaneidad (OB-02) controlando alertas y validaciones por EPS. Todo cambio queda bajo una trazabilidad comprobable de los estados de cobro.

---

## 2. Registro de Usuarios e Inicio de Sesión (CS-11)
El sistema opera sobre una estructura de seguridad basada en roles (ADMIN, GESTION_HUMANA, CONTABILIDAD, COLABORADOR). Todo miembro se somete al registro inicial.

### 2.1 Registro de Usuario
1. **Endpoint:** `POST /api/auth/registrar`
2. El sistema recibe el payload con documento, nombre, email, contraseña y el rol correspondiente.
3. El sistema cifra la contraseña empleando bcrypt y la almacena en base de datos.
4. El sistema restringe la duplicidad asegurando un documento único y emite un código 201 (Created).

### 2.2 Autenticación (Login)
1. **Endpoint:** `POST /api/auth/login`
2. El usuario envía sus credenciales (documento y contraseña) mediante formato OAuth2.
3. El sistema recibe, desencripta internamente y valida el hash contra PostgreSQL.
4. El sistema emite un Token **JWT** que incluye internamente el rol (Claim: `rol`), permitiendo proteger jerárquicamente las rutas posteriores.

---

## 3. Registro y Validación de Incapacidades (CS-01, CS-02, CS-10)

### 3.1 Captura de Novedad Médica
1. El Colaborador (usuario) informa la novedad a recursos humanos y hace entrega de la documentación (epicrisis, FURIPS, certificado).
2. **Endpoint:** `POST /api/incapacidades/`
3. El sistema recibe el payload con:
   * Información del evento: Días otorgados, EPS responsable, Fechas (Inicio y fin).
   * Diagnóstico (CIE10 protegido).
   * Arreglo con la metadata digital de los soportes (CS-10).

### 3.2 Validación Estricta
1. El sistema intercepta y rechaza la inserción con un **Error 400 (Bad Request)** si no se adjuntan las URL correspondientes a los **Soportes Obligatorios**. 
2. El sistema inserta en transacción (ACID) la `Incapacidad` con estado por defecto **`REGISTRADA`** vinculada al `colaborador_id`.
3. El sistema genera URLs ficticias / base64 simulando el proceso de almacenamiento digital.

---

## 4. Gestión de Estados y Transcripción (CS-04, CS-05)

El administrador de *Gestión Humana* audita las novedades en el sistema.

### 4.1 Cambios de Estado Cíclicos
* **Endpoint:** `PATCH /api/incapacidades/{id}/estado`
* **Transiciones Esperadas:** `REGISTRADA` -> `TRANSCRITA` -> `RADICADA` -> `PAGADA` (o alternativa a `RECHAZADA`/`GLOSADA`).
* El sistema verifica que el token del solicitante posea el rol `GESTION_HUMANA` o `ADMIN`.
* El sistema previene alteraciones financieras realizando `commit` y un `refresh` atómico de base de datos.
* **Privacidad (Regulación Crítica):** El sistema oculta activamente los diagnósticos CIE10 cuando el colaborador solicita la lista (`GET /api/incapacidades/`). Sólo perfiles directivos observan la patología sin filtro.

### 4.2 Trazabilidad Operativa (CS-05)
* **Endpoint:** `GET /api/incapacidades/{id}/trazabilidad`
* El sistema asienta localmente el registro del cambio. Esto soporta auditorías futuras de conciliación para retenciones excesivas.

---

## 5. Control de Tiempos y Alertas de Vencimiento (CS-03)

El objetivo OB-02 evita la extemporaneidad y mitigando un alto riesgo financiero.

* **Endpoint:** `GET /api/alertas/vencimientos`
* El sistema es invocado temporal o activamente desde el FrontEnd para que verifique la fecha en la que se generó la `Incapacidad` frente al parámetro maestro guardado de la `EPS` (ej: 150 días para SURA, 1095 días para Sanitas).
* El sistema detecta incapacidades que se encuentran en el estado **`RADICADA`** pero cuya fecha de alerta arroja un margen menor o igual a **30 días** respecto al límite de vencimiento, devolviendo una estructura al supervisor de Gestión Humana para intervención de Escalamiento Jurídico (CS-09).

---

## 6. Gestiòn de Cobro Administrativo y Conciliación (CS-06, CS-07)

Cuando la EPS autoriza, gira el pago en favor del prestador o retenedor.

* **Endpoint:** `POST /api/finanzas/conciliar`
* **Operación y Finalizado:** El perfil `CONTABILIDAD` alimenta el sistema con el valor monetario pagado vinculado por llave Foránea (UUID) a la incapacidad. 
* El sistema detecta la liquidación y mueve el estado final a **`PAGADA`**.
* El sistema detiene automáticamente los contadores y extrae la notificación del panel de Alertas.
