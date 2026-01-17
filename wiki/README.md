# Wiki - Documentación del Sistema de Trading

Documentación completa de la aplicación de trading, organizada para desarrolladores y usuarios finales.

## 📖 Estructura de la Documentación

### 🔧 [Documentación Técnica](./technical/) (Para Desarrolladores)

Documentación detallada del backend, APIs, modelos de datos y lógica de negocio.

**Contenido**:
- Arquitectura y modelos de datos
- Endpoints REST API con request/response
- Servicios y métodos internos
- Lógica de negocio y algoritmos
- Validaciones y restricciones
- DTOs y tipos TypeScript
- Estrategias de testing

**Módulos**:
- [Operaciones - API](./technical/operaciones-api.md) - Sistema de operaciones de trading
- [Historial de Precios - API](./technical/historial-precios.md) - Sistema de historial de precios de símbolos
- [Analítica - API](./technical/analytics-api.md) - Sistema de Business Intelligence y dashboard
- [Símbolos - API](./technical/symbols-api.md) - Gestión y ordenación de símbolos

---

### 👤 [Manual de Usuario](./user-guide/) (Para Usuarios Finales)

Guías prácticas paso a paso para usar la aplicación.

**Contenido**:
- ¿Qué es y para qué sirve?
- Conceptos básicos explicados de forma simple
- Cómo realizar cada acción (paso a paso)
- Ejemplos prácticos del día a día
- Preguntas frecuentes (FAQ)
- Consejos y buenas prácticas

**Módulos**:
- [Operaciones - Guía de Usuario](./user-guide/operaciones.md) - Cómo gestionar tus inversiones
- [Historial de Precios - Guía de Usuario](./user-guide/historial-precios.md) - Cómo gestionar el historial de precios
- [Analítica - Guía de Usuario](./user-guide/analytics.md) - Cómo usar el dashboard de analítica
- [Símbolos - Guía de Usuario](./user-guide/symbols.md) - Cómo gestionar y ordenar símbolos

---

## 🗂️ Organización de Archivos

```
wiki/
├── README.md                          # Este archivo
├── technical/                         # Documentación técnica
│   ├── operaciones-api.md            # API de operaciones
│   ├── historial-precios.md          # API de historial de precios
│   └── analytics-api.md              # API de analítica
└── user-guide/                        # Manuales de usuario
    ├── operaciones.md                # Guía de operaciones
    ├── historial-precios.md          # Guía de historial de precios
    └── analytics.md                  # Guía de analítica
```

---

## 📝 Guía para Documentar Nuevos Módulos

Cada nuevo módulo o evolutivo debe documentarse en **ambas secciones**:

### Documentación Técnica (`technical/`)

Debe incluir:
1. **Modelo de Datos**: Tablas, campos, relaciones, índices
2. **Endpoints API**: Métodos, rutas, request/response, errores
3. **Servicios**: Métodos públicos y privados con firma
4. **Lógica de Negocio**: Algoritmos, fórmulas, condiciones
5. **Validaciones**: A nivel BD y aplicación
6. **DTOs**: Estructuras de datos
7. **Testing**: Cobertura y estrategias

### Manual de Usuario (`user-guide/`)

Debe incluir:
1. **Introducción**: Qué es y para qué sirve (lenguaje simple)
2. **Conceptos Básicos**: Términos explicados de forma clara
3. **Tipos/Variantes**: Si aplica (ej: Long vs Short)
4. **Guía Paso a Paso**: Cómo hacer cada acción principal
5. **Ejemplos Prácticos**: Casos reales del día a día
6. **Preguntas Frecuentes**: Dudas comunes
7. **Consejos**: Buenas prácticas

---

## 🎯 Principios de Documentación

1. **Separación clara**: Técnica para devs, usuario para usuarios
2. **Ejemplos reales**: Usar casos concretos con números
3. **Lenguaje apropiado**: Técnico en technical/, simple en user-guide/
4. **Mantener actualizado**: Documentar junto con el código
5. **Ser específico**: Evitar ambigüedades, dar detalles exactos
6. **Incluir edge cases**: Documentar comportamientos especiales

---

## 📚 Módulos Disponibles

| Módulo | Estado | Documentación Técnica | Manual Usuario |
|--------|--------|----------------------|----------------|
| Operaciones | ✅ Fase 2 | [Ver](./technical/operaciones-api.md) | [Ver](./user-guide/operaciones.md) |
| Historial de Precios | ✅ Completado | [Ver](./technical/historial-precios.md) | [Ver](./user-guide/historial-precios.md) |
| Analítica | ✅ Completado | [Ver](./technical/analytics-api.md) | [Ver](./user-guide/analytics.md) |
| Autenticacion | ✅ Completado | [Ver](./technical/auth-api.md) | [Ver](./user-guide/auth.md) |
| Símbolos | ✅ Completado | [Ver](./technical/symbols-api.md) | [Ver](./user-guide/symbols.md) |

---

## 🔄 Roadmap de Documentación

- [x] Estructura base de wiki separada
- [x] Documentación de Operaciones (Backend - Fase 2)
- [x] Documentación de Historial de Precios (Refactorización)
- [x] Documentación de Analítica (Business Intelligence)
- [ ] Documentación de Operaciones (Frontend - Fase 3-5)
- [ ] Documentación de Símbolos
- [ ] Documentación de Cuentas
- [ ] Documentación de Transacciones
- [ ] Screenshots y videos tutoriales
