# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Aplicación de gestión de inversiones financieras (trading). Stack: MariaDB + NestJS + Quasar/Vue 3.

## Documentación

Archivos de conocimiento en `.claude/`:
- `GUIDELINES.md` - Directrices de comunicación y código
- `ARCHITECTURE.md` - Arquitectura del proyecto
- `COMMANDS.md` - Comandos de desarrollo
- `VUE_COMPONENTS.md` - Directrices Vue/Quasar
- `plans/` - Planes de desarrollo y tracking

Documentación funcional en `wiki/`:
- Documentación del funcionamiento de la aplicación
- Sirve como referencia técnica y manual de usuario
- Cada evolutivo debe documentarse aquí

## Planes de Desarrollo

Todo plan debe incluir un paso final de **documentación en wiki/** que describa:
- Flujo y proceso del evolutivo
- Funcionamiento backend y frontend
- Funcionalidades implementadas
- Restricciones y validaciones
- Permisos requeridos
- Guía de uso para el usuario

## Reglas Principales

1. **SOLID** + funciones de propósito único
2. **Documentar**: cabeceras en clases/métodos, comentarios en código complejo
3. **Vue componentizado**: componentes pequeños, reutilizables
4. **Resúmenes concisos**: sin explicaciones exhaustivas
5. **Eficiencia de tokens**: sin procesos en segundo plano

## Configuración

Copiar `.env.example` a `.env`:
- `docker/trading/.env`
- `api/.env`
