Descripción:
En una aplicacion de reservas online con las siguientes caracteristicas, reservas de zonas de juegos y salto, ventas de articulos.
Se pide implementar un dashboard para poder visualizar ganancias, reservas, checkins (verificacion del cliente en el local), cargados(personas que asisten a la reserva). En un periodo seleccionado (1 sem, 1 mes, etc) y en una fecha especifica (1 dia). Ambos utilizando la misma api, donde la informacion viene de la siguiente manera.
`{
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
}`
Ademas de una api para las ganancias.
`{
    "FechaReservaInicio": "2023-11-07T00:00:00.000Z",
    "Origen": "WEB",
    "Operaciones": 1,
    "ImporteTotal": 2010
},`
Ademas con las ganacias se pide diferenciar de las producidas mediante el citio web y las que son hechas en el local.

ACLARACION: No se tiene acceso a la api. Y tampoco esta la posibilidad de usar graphQL.
