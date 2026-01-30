# A) Resumen de Interpretación - MenúFamilia MVP

## Qué va a hacer la app en el MVP

**MenúFamilia** es una aplicación offline-first para planificar menús familiares semanales/mensuales, con foco en:

1. **Evitar duplicados cena-cole**: La app detecta qué comieron los niños en el colegio y sugiere cenas que no repitan la proteína/categoría principal.

2. **Gestión de restricciones alimentarias**: Tres perfiles infantiles con restricciones específicas (piel de fruta, huevo condicional, alimentación complementaria).

3. **Importación de menú escolar**: Desde foto/PDF, con validación humana del OCR.

4. **Generación automática de menús**: Motor de sugerencias basado en reglas, patrones y catálogo de recetas.

5. **Plan vs Real**: Separación clara entre lo planificado y lo realmente consumido.

6. **Lista de compra automática**: Generada desde el plan de comidas.

### Alcance MVP (Fase 1)
| Incluido | Excluido (Fases posteriores) |
|----------|------------------------------|
| Vista Hoy + Calendario mensual | Sincronización multi-dispositivo |
| CRUD de recetas con ingredientes | Compartir menús entre familias |
| Importación menú escolar (foto) | Integración con supermercados |
| Generación de menú automática | Escaneo de tickets de compra |
| Lista de compra por rango | Sugerencias nutricionales avanzadas |
| Registro plan vs real | Gamificación / estadísticas |
| Reglas fijas y patrones semanales | Múltiples familias por cuenta |
| Notas por día | Modo recetas colaborativas |
| Edición múltiple de días | Importación desde apps de recetas |

---

## Decisiones y Suposiciones

### S1: Definición operativa de "duplicado"
**Decisión**: Un plato de cena "duplica" el del cole si comparten la **proteína principal** (pollo, cerdo, ternera, pescado blanco, pescado azul, huevo, legumbres) O la **categoría de plato** (pasta, arroz, guiso, fritura).

**Ejemplo**: Si en el cole comieron "Macarrones con tomate", la cena no debería incluir otra pasta. Si comieron "Pollo asado", la cena no debería incluir pollo.

### S2: Estructura del menú escolar
**Suposición**: Los menús escolares españoles típicamente tienen esta estructura:
- Primer plato (verdura/legumbre/pasta/arroz)
- Segundo plato (proteína + guarnición)
- Postre (fruta/lácteo)

El sistema extraerá los 3 componentes y usará el segundo plato como referencia principal para evitar duplicados.

### S3: Horarios de comidas
**Suposición**:
- **Colegio**: Solo almuerzo (comida del mediodía), L-V
- **Casa**: Cena L-V obligatoria; Comida y cena S-D opcional
- **Desayuno y merienda**: Fuera de alcance MVP

### S4: Miembros de la familia y sus slots
**Decisión**:
- **Niños (3)**: Comen en cole L-V, cenan en casa L-V
- **Adultos (2)**: Comida fuera (trabajo) L-V, cena en casa L-V, comida+cena en casa S-D
- **Bebé**: Siempre en casa, menú separado (papillas/BLW)

### S5: Huevo condicional (niña 2,5 años)
**Decisión operativa**:
- `huevo_directo` = PROHIBIDO (tortilla, huevo frito, huevo cocido)
- `huevo_horneado` = PERMITIDO (bizcocho, galletas, rebozados)
- `huevo_trazas` = PERMITIDO (puede contener trazas)

Cada receta/plato tendrá tags: `contiene_huevo_directo`, `contiene_huevo_horneado`, `puede_contener_huevo_trazas`

### S6: Piel de fruta (niño 4 años)
**Decisión**: Las frutas se marcan con tag `requiere_pelar`. El sistema:
- Avisa si se planifica fruta con piel para ese niño
- Sugiere alternativa (misma fruta pelada o fruta sin piel)

### S7: Alimentación bebé 9 meses
**Suposición**: El bebé tiene su propio "carril" de menú con categorías:
- Purés (verduras, frutas, pollo)
- Papillas (cereales, frutas)
- BLW (brócoli vapor, coliflor, zanahoria, etc.)
- Este menú se planifica manualmente; no se genera automáticamente en MVP

### S8: Pizza del jueves
**Decisión**:
- Por defecto, jueves cena = "Pizza comprada" (receta especial marcada como `regla_fija`)
- Editable: el usuario puede cambiarla, y queda registro en `actual` de lo que realmente se comió
- Si se cambia, no afecta a los siguientes jueves (patrón sigue aplicando)

### S9: Platos únicos fin de semana
**Decisión**: Para adultos en S-D, el generador prioriza:
- Legumbres con proteína (lentejas con chorizo, garbanzos con espinacas)
- Guisos completos (cocido, estofado)
- Arroces completos (paella, arroz con pollo)
- Ensaladas completas (con proteína)

Tag en recetas: `plato_unico = true/false`

### S10: Confianza mínima OCR
**Decisión**: Si la confianza del OCR es < 70% para un campo, se marca como "requiere revisión" y el usuario debe confirmar/corregir antes de guardar.

---

## Riesgos Principales y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **OCR falla con menús mal escaneados** | Alta | Alto | UI de corrección fácil; permitir edición manual completa; guardar imagen original para re-procesar |
| **Menús escolares sin estructura estándar** | Media | Medio | Prompt de IA adaptativo; templates por colegio; modo "pegado de texto" alternativo |
| **Ambigüedad en proteína principal** | Alta | Medio | Normalización de platos con IA; diccionario de sinónimos; usuario puede corregir |
| **Días no lectivos no detectados** | Media | Bajo | Campo "día no lectivo" editable; importar calendario escolar si está disponible |
| **Restricciones condicionales complejas** | Baja | Alto | Modelo de datos flexible con condiciones; validación en generación y alertas visuales |
| **Cambio de proveedor IA** | Media | Bajo | Contratos JSON estrictos; capa de abstracción; proveedores intercambiables |
| **App lenta en móviles antiguos** | Media | Alto | Offline-first con IndexedDB; lazy loading; sin frameworks pesados; target <2s arranque |
| **Usuario no técnico se pierde** | Media | Alto | Onboarding guiado; UI mínima; máximo 3 toques para cualquier acción |

---

## Flujo Principal del Usuario (MVP)

```
1. INICIO DE MES
   └── Importar menú escolar (foto/PDF)
       └── Revisar/corregir OCR
       └── Guardar menú del cole

2. GENERAR MENÚ
   └── Click "Generar mes"
   └── Sistema aplica: reglas fijas + patrones + anti-duplicado + restricciones
   └── Usuario revisa sugerencias
   └── Ajusta días específicos si quiere
   └── Confirma plan

3. DÍA A DÍA
   └── Abre "Vista Hoy"
   └── Ve qué toca hoy (cole + cena planificada)
   └── Si cambia algo → edita (queda en plan, luego registra real)
   └── Al final del día: marca "comido" o edita "real"

4. COMPRA
   └── Selecciona rango (semana/mes)
   └── Genera lista de compra
   └── Marca comprados / exporta

5. RECETAS
   └── Añade recetas manualmente o por texto libre
   └── Sistema extrae ingredientes
   └── Categoriza automáticamente
```

---

## Métricas de Éxito MVP

1. **Tiempo de apertura**: < 2 segundos en frío
2. **Toques para cambiar cena**: ≤ 3
3. **Precisión OCR menú escolar**: > 80% sin corrección manual
4. **Cobertura de generación**: > 90% de slots rellenados automáticamente
5. **Satisfacción**: Usuario puede planificar mes completo en < 15 minutos
