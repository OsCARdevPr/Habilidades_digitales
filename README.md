# Proyecto de Contingencia E-commerce con Alta Disponibilidad

Este proyecto demuestra una aplicación de comercio electrónico básica con una arquitectura diseñada para alta disponibilidad, utilizando replicación de bases de datos MySQL (maestro-esclavo) y un proxy inverso (Nginx) para gestionar la conexión a la base de datos activa.

## Arquitectura General

El sistema se compone de:

*   **Frontend:** Una aplicación React para la interfaz de usuario.
*   **Backend:** Un servidor Node.js (Express) que maneja la lógica de negocio y la API.
*   **Bases de Datos:**
    *   `mysql_master`: Instancia principal de MySQL.
    *   `mysql_slave`: Réplica de la instancia principal.
*   **Proxy:** Nginx configurado para dirigir el tráfico de la base de datos y, en un escenario ideal de producción, para balancear la carga y gestionar el failover (aunque el failover de DB aquí es manejado a nivel de la lógica de conexión del backend).

## Prerrequisitos

*   Docker y Docker Compose instalados.
*   Node.js y npm/yarn para el desarrollo del frontend (si se desea modificar o construir localmente).
*   Un editor de código (ej. VS Code).
*   Git para clonar el repositorio.

## Estructura del Proyecto

```
proyecto_contingencia/
├── docker-compose.yml       # Orquestación de los servicios Docker
├── frontend/                # Código fuente de la aplicación React
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md            # README específico del frontend
├── mysql_master/            # Configuración y datos de la BD maestra
│   ├── init.sql             # Script SQL inicial para la BD maestra
│   └── my.cnf               # Configuración de MySQL para el maestro
├── mysql_slave/             # Configuración y datos de la BD esclava
│   └── my.cnf               # Configuración de MySQL para el esclavo
├── node_server/             # Código fuente del servidor backend Node.js
│   ├── config/
│   │   └── database.js      # Lógica de conexión a BD y failover
│   ├── models/
│   ├── routes/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── proxy/                   # Configuración de Nginx
│   └── nginx.conf
├── .gitignore               # Archivos a ignorar por Git
└── README.md                # Este archivo
```

## Configuración y Ejecución

### 1. Variables de Entorno

Antes de iniciar, es crucial configurar las variables de entorno. Crea los siguientes archivos `.env` si no existen, basados en los archivos `.env.example` o las configuraciones por defecto que puedas tener.

*   **`proyecto_contingencia/node_server/.env`** (para el backend):
    ```env
    DB_MASTER_HOST=mysql_master
    DB_MASTER_USER=root
    DB_MASTER_PASSWORD=master_password
    DB_MASTER_DATABASE=mi_base_de_datos
    DB_MASTER_PORT=3306

    DB_SLAVE_HOST=mysql_slave
    DB_SLAVE_USER=root
    DB_SLAVE_PASSWORD=slave_password
    DB_SLAVE_DATABASE=mi_base_de_datos
    DB_SLAVE_PORT=3306

    BACKEND_PORT=3001
    JWT_SECRET=tu_secreto_jwt_aqui
    ```

*   **`proyecto_contingencia/frontend/.env`** (para el frontend):
    ```env
    REACT_APP_API_URL=http://localhost:3001/api
    ```

    **Nota:** Asegúrate de que `DB_MASTER_PASSWORD` y `DB_SLAVE_PASSWORD` coincidan con las contraseñas definidas en tu `docker-compose.yml` para los servicios de MySQL.

### 2. Iniciar todos los servicios con Docker Compose

Desde la raíz del directorio `proyecto_contingencia`, ejecuta:

```bash
docker-compose up --build
```

Esto construirá las imágenes de los contenedores (si es la primera vez o si hay cambios en los Dockerfiles) y luego iniciará todos los servicios definidos en `docker-compose.yml`:

*   Frontend (React app) accesible en `http://localhost:3000`
*   Backend (Node.js server) accesible en `http://localhost:3001`
*   Proxy Nginx (escuchando en el puerto definido, usualmente 80 u otro si se mapea diferente, y gestionando conexiones a las BBDD)
*   Base de datos `mysql_master`
*   Base de datos `mysql_slave` (replicando desde `mysql_master`)

El script `mysql_master/init.sql` se ejecutará automáticamente al crear la base de datos maestra por primera vez, creando las tablas necesarias y un usuario de replicación.

### 3. Acceder a la Aplicación

Una vez que todos los contenedores estén en funcionamiento:

*   Abre tu navegador y ve a `http://localhost:3000` para interactuar con la aplicación de E-commerce.

## Simulación de Caída de la Base de Datos Maestra

El backend (`node_server/config/database.js`) está configurado para intentar conectarse primero a `mysql_master`. Si esta conexión falla, intentará conectarse a `mysql_slave`.

Para simular la caída de la base de datos maestra:

1.  **Verifica que la aplicación funciona:** Navega por la aplicación, realiza alguna consulta que implique leer datos de la base de datos.

2.  **Detén el contenedor de `mysql_master`:**
    En una nueva terminal, desde la raíz del proyecto, ejecuta:
    ```bash
    docker-compose stop mysql_master
    ```

3.  **Observa el comportamiento:**
    *   Intenta acceder a funcionalidades de la aplicación que requieran acceso a la base de datos (ej. ver productos, iniciar sesión).
    *   El backend Node.js debería detectar que `mysql_master` no está disponible y automáticamente redirigir las consultas de lectura a `mysql_slave`.
    *   **Importante:** Las operaciones de escritura seguirán fallando, ya que la base de datos esclava es de solo lectura por configuración de replicación estándar. Una solución completa de failover para escrituras requeriría promocionar la esclava a maestra, lo cual es un proceso más complejo y fuera del alcance de esta simulación básica de contingencia de lectura.
    *   Revisa los logs del contenedor del backend para ver los intentos de conexión y el cambio a la base de datos esclava:
        ```bash
        docker-compose logs -f node_server
        ```

4.  **Restaurar `mysql_master`:**
    Para volver al estado normal, inicia nuevamente el contenedor de la base de datos maestra:
    ```bash
    docker-compose start mysql_master
    ```
    La aplicación debería volver a utilizar `mysql_master` para sus operaciones (puede requerir un reinicio del `node_server` o esperar a que la lógica de re-conexión se active, dependiendo de la implementación en `database.js`).

## Desarrollo y Despliegue del Frontend

El frontend es una aplicación React creada con Create React App.

### Desarrollo Local (fuera de Docker)

Si deseas trabajar en el frontend fuera del entorno Docker (por ejemplo, para un desarrollo más rápido con hot-reloading nativo):

1.  **Navega al directorio del frontend:**
    ```bash
    cd frontend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    # o si usas yarn:
    # yarn install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm start
    # o
    # yarn start
    ```
    Esto generalmente abrirá la aplicación en `http://localhost:3000` y se recargará automáticamente al guardar cambios.
    Asegúrate de que el backend (Node.js) esté corriendo (ya sea vía Docker o localmente) y que la variable `REACT_APP_API_URL` en `frontend/.env` apunte a la URL correcta del backend.

### Construcción para Producción (Build)

Cuando quieras desplegar el frontend, necesitas crear una compilación optimizada:

1.  **Navega al directorio del frontend:**
    ```bash
    cd frontend
    ```

2.  **Ejecuta el script de build:**
    ```bash
    npm run build
    # o
    # yarn build
    ```
    Esto creará una carpeta `build/` dentro de `frontend/` con los archivos estáticos listos para ser desplegados en cualquier servidor web (Nginx, Apache, Vercel, Netlify, GitHub Pages, etc.).

    Si estás usando el `docker-compose.yml` proporcionado, el servicio `frontend` ya está configurado para servir estos archivos estáticos (usualmente a través de un servidor Nginx o similar dentro de su propio contenedor Docker, o el Dockerfile del frontend podría estar usando `serve` o Nginx para servir el build).

## Subir el Proyecto a GitHub

1.  **Asegúrate de tener un archivo `.gitignore` adecuado** (ya creado en un paso anterior) para excluir `node_modules/`, archivos `.env` con credenciales, logs, directorios de datos de las bases de datos locales, y otros archivos innecesarios.

2.  **Inicializa un repositorio Git** (si aún no lo has hecho):
    ```bash
    git init
    ```

3.  **Añade los archivos al staging area:**
    ```bash
    git add .
    ```

4.  **Realiza tu primer commit:**
    ```bash
    git commit -m "Commit inicial del proyecto de contingencia e-commerce"
    ```

5.  **Crea un nuevo repositorio en GitHub.**

6.  **Enlaza tu repositorio local con el repositorio remoto de GitHub:**
    ```bash
    git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPOSITORIO.git
    ```
    (Reemplaza `TU_USUARIO` y `NOMBRE_DEL_REPOSITORIO` con tus datos).

7.  **Sube tus cambios a GitHub:**
    ```bash
    git push -u origin master # o main, dependiendo de tu rama por defecto
    ```

## Consideraciones Adicionales

*   **Seguridad:** Las contraseñas y secretos deben manejarse de forma segura, preferiblemente utilizando secretos de Docker o variables de entorno inyectadas en el momento del despliegue en un entorno de producción, y nunca deben ser subidas al repositorio Git.
*   **Persistencia de Datos:** Los volúmenes de Docker (`master_db_data`, `slave_db_data`) están configurados para persistir los datos de MySQL entre reinicios de los contenedores. Asegúrate de entender cómo funcionan los volúmenes si mueves o respaldas tu proyecto.
*   **Failover Completo:** La simulación actual demuestra un failover de lectura. Un failover completo que incluya la promoción de la esclava a maestra para escrituras es más complejo e involucra reconfigurar la replicación y potencialmente la aplicación.
*   **Logs:** Revisa los logs de cada contenedor para diagnosticar problemas:
    ```bash
    docker-compose logs -f nombre_del_servicio # ej: node_server, mysql_master, frontend
    ```

---

¡Gracias por revisar este proyecto!
