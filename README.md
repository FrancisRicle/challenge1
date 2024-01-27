# Dashboard para Reservas Online - Informe Técnico

## Descripción

Este proyecto se centra en la mejora de una aplicación de reservas en línea con características específicas, incluyendo reservas de zonas de juegos y salto, así como ventas de artículos asociados. La tarea principal consiste en la implementación de un completo dashboard que permita visualizar de manera eficiente las ganancias, reservas, check-ins (verificación de la presencia del cliente en el local) y cargados (personas que asisten a la reserva). El dashboard deberá ofrecer esta información en dos niveles de detalle: en un periodo seleccionado (por ejemplo, 1 semana, 1 mes) y en una fecha específica (por ejemplo, 1 día). Todo esto se realizará a través de la misma API, la cual proporciona la información en formato JSON.

## Ejemplo de Datos de Reservas (API Reservas)

```json
{
    "CodigoArticulo": "Z1",
    "Articulo": "ZONA DE SALTO",
    "CodigoPresentacion": "1",
    "Presentacion": "STANDARD",
    "ParticipantesDeLaPresentacion": 1,
    "CodigoUnidadMedida": "60MIN",
    "UnidadMedida": "60 MINUTOS",
    "FechaReservaInicio": "2023-11-09T14:00:00.000Z",
    "Cantidad": 2,
    "Participantes": 2,
    "IntegrantesCargados": 2,
    "IntegrantesCargadosConCheckIn": 2,
    "Origen": "WEB"
}
```
## Ejemplo de Datos de Ganancias (API Ganancias)
```json
{
    "FechaReservaInicio": "2023-11-07T00:00:00.000Z",
    "Origen": "WEB",
    "Operaciones": 1,
    "ImporteTotal": 2010
}
```
# Funcionalidades Adicionales
- **Diferenciación de Ganancias:** Se requiere la capacidad de diferenciar las ganancias generadas a través del sitio web y aquellas realizadas directamente en el local. Esta distinción proporciona una visión más detallada del rendimiento financiero.

# Restricciones
- **Acceso a la API:** No se cuenta con acceso a la API directa.
- **Uso de GraphQL:** No es posible utilizar GraphQL en este contexto.

Este informe técnico busca destacar la importancia y la utilidad de la implementación de un dashboard para mejorar la toma de decisiones basada en datos concretos. A pesar de las limitaciones mencionadas, se busca maximizar la eficiencia y la comprensión de la información disponible, ofreciendo a los usuarios una herramienta valiosa para la gestión y la optimización de las operaciones relacionadas con las reservas en línea.

![ScreenShotReadMe](https://github.com/FrancisRicle/challenge1/assets/63601533/f5d921f9-5669-4ced-b050-77466c318e91)
