# Módulo de Autenticación JWT

Este módulo implementa un método de autenticación basado en JSON Web Tokens (JWT) para proteger las rutas de la API.
Utiliza el guard `AuthGuard` para verificar la validez del token JWT en las solicitudes entrantes.

# Importación del módulo de autenticación JWT

Para importar el módulo a otro proyecto hay que tener en cuenta el uso de las variables de entorno.

El módulo utiliza Config service para gestionar las variables de entorno a través de un archivo de configuración.

```ts
import { ConfigService } from '@nestjs/config';
```

Principalmente las variables necesarias son las siguientes:

```.dotenv
JWT_SECRET=''
JWT_ISSUER=''
JWT_AUDIENCE=''
JWT_SUBSCRIBE=''
JWT_CLOCK_TOLERANCE='5' #in seconds
JWT_EXPIRATION='60' #in seconds
```

Estas variables se utilizan en el módulo y en el guard. 

