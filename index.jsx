import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
/* 
  useAsync permite realizar una promesa y retorna su estado, 
  resultado en caso de exito y error en caso de error.
  Recibe una funcion que retorna la promesa, las dependencias (volvera a ejecutar la promesa cuando estos cambien),
  y un valor booleano si es true se ejecuta en el primer renderizado del componente caso controrio se ejecuta solo si las dependencias cambian
*/
import { useAsync } from "hooks";
/* 
  useDay retorna el dia selecionado para crear el grafico.
  useRange retorna el rango selecciona ".
  useZone retorna la zona seleccionada (ZONA DE SALTO -> Z1/Z2, ZONA DE JUEGOS -> ZJ)".
*/
import { useDay, useRange, useZona } from "hooks/dashboard";
/* Apis */
import { getResumenParticipantes, getResumenVentas } from "apis/dashboard";
/* Graficos de react-charts */
import BigChartBoxRange from "../bigChartBox/BigChartBox";
import BigChartBox from "../bigChartBoxRange/BigChartBoxRange";
import ChartBox from "../chartBox/ChartBox";
import PieChartBox from "../pieCartBox/PieChartBox";
import PieChartBoxImportes from "../pieCartBoxImportes/PieChartBoxImportes";
/* estilos */
import "./home.scss";
/* Con un array de objectos  retorna un objeto con las claves igual la resultado de la funcion fn. Similar a Object.groupBy Solo que no es estandar al momento*/
function groupBy(data, fn) {
  const res = {};
  const getOrDef = (key) => {
    if (!(res[key] instanceof Array)) {
      return [];
    }
    return res[key];
  };
  for (const d of data) {
    res[fn(d)] = [...getOrDef(fn(d)), d];
  }
  return res;
}
/** API para participantes cargados, reservados, checkins */
async function participantes(params, desde, hasta) {
  const resumenPeriodo = await getResumenParticipantes(params, desde, hasta);
  return resumenPeriodo;
}
/** API para ganancios Operaciones, Origen (WEB/LOCAL) Importe */
async function ventas(params, desde, hasta) {
  return await getResumenVentas(params, desde, hasta);
}
function useVentas(desde, hasta, attr) {
  const params = useParams();
  const ventasData = useAsync(
    () => ventas(params, desde, hasta),
    [params, desde, hasta],
    desde === hasta // por defecto se usa la fecha actual para el grafico del dia
  );
  // como es un calculo complejo evito que se recalcule en cada renderizado.
  return useMemo(() => {
    const res = [];
    const filter = (d) => format(new Date(d.FechaReservaInicio), "dd/MM/yyyy");
    if (ventasData.result) {
      const g = groupBy(ventasData.result, filter);
      for (const k in g) {
        // Los graficos reciben dia como eje x web y local como ejes y
        res.push({
          dia: k,
          web: g[k].find((w) => w.Origen === "WEB")?.[attr] || 0,
          local: g[k].find((l) => l.Origen === "LOCAL")?.[attr] || 0,
        });
      }
    }
    return res;
  }, [ventasData]);
}
function useOperciones(desde, hasta) {
  return useVentas(desde, hasta, "Operaciones");
}
function useImportes(desde, hasta) {
  return useVentas(desde, hasta, "ImporteTotal");
}
function useParticipantes(zona, desde, hasta, filter) {
  const params = useParams();
  const reduceReservados = (p, c) => p + c.Participantes;
  const reduceCargados = (p, c) => p + c.IntegrantesCargados;
  const reduceCheckIns = (p, c) => p + c.IntegrantesCargadosConCheckIn;
  const participantesRangeData = useAsync(
    () => participantes(params, desde, hasta),
    [params, desde, hasta],
    desde === hasta // por defecto se usa la fecha actual para el grafico del dia
  );
  // como es un calculo complejo evito que se recalcule en cada renderizado.
  return useMemo(() => {
    if (
      participantesRangeData.status === "success" &&
      participantesRangeData.result &&
      zona
    ) {
      const data = [];
      const g = groupBy(
        participantesRangeData.result.filter(
          (p) => p.CodigoArticulo === zona.CodigoArticulo
        ),
        filter
      );
      for (const k in g) {
        // Los graficos reciben dia como eje x reservados , cargados y checkins como ejes y
        data.push({
          dia: k,
          reservados: g[k].reduce(reduceReservados, 0),
          cargados: g[k].reduce(reduceCargados, 0),
          checkIns: g[k].reduce(reduceCheckIns, 0),
        });
      }
      return data;
    }
    return [];
  }, [participantesRangeData]);
}
function useParticipantesRange(zona, desde, hasta) {
  return useParticipantes(zona, desde, hasta, (d) =>
    format(new Date(d.FechaReservaInicio), "dd/MM/yyyy")
  );
}
function useParticipantesDay(zona, day) {
  return useParticipantes(zona, day, day, (d) =>
    format(new Date(d.FechaReservaInicio), "HH:mm")
  );
}
export default function Home() {
  const day = useDay();
  const [desde, hasta] = useRange();
  const zona = useZona();
  const participantesRangeData = useParticipantesRange(zona, desde, hasta);
  const participantesDayData = useParticipantesDay(zona, day);
  const operaciones = useOperciones(desde, hasta);
  const importes = useImportes(desde, hasta);
  const operacionesDay = useOperciones(day, day);
  const importesDay = useImportes(day, day);
  // El total para hacer un resumen
  const importesTotal = useMemo(
    () => importes.reduce((p, c) => p + c.web + c.local, 0),
    [importes]
  );
  // El total para hacer un resumen
  const operacionesTotal = useMemo(
    () => operaciones.reduce((p, c) => p + c.web + c.local, 0),
    [operaciones]
  );
  return (
    <div className="home">
      <div className="box box2">
        <ChartBox
          chartData={operaciones}
          dataKey1="web"
          dataKey2="local"
          title="Operaciones"
          number={operacionesTotal}
          color1="#dcf763"
          color2="#39b697"
        />
      </div>
      <div className="box box3">
        <ChartBox
          chartData={importes}
          dataKey1="web"
          dataKey2="local"
          title="Importes"
          number={importesTotal}
          color1="#dcf763"
          color2="#39b697"
        />
      </div>
      <div className="box box4">
        {operacionesDay[0] ? (
          <PieChartBox
            data={[
              { name: "WEB", value: operacionesDay[0].web, color: "#dcf763" },
              {
                name: "LOCAL",
                value: operacionesDay[0].local,
                color: "#39b697",
              },
            ]}
          />
        ) : day ? (
          "Seleccione la fecha"
        ) : (
          "Sin operaciones"
        )}
      </div>
      <div className="box box5">
        {importesDay[0] ? (
          <PieChartBoxImportes
            data={[
              { name: "WEB", value: importesDay[0].web, color: "#dcf763" },
              { name: "LOCAL", value: importesDay[0].local, color: "#39b697" },
            ]}
          />
        ) : day ? (
          "Seleccione la fecha"
        ) : (
          "Sin importes"
        )}
      </div>
      <div className="box box6">
        {participantesRangeData.length > 0 ? (
          <BigChartBoxRange data={participantesRangeData} />
        ) : !desde && !hasta ? (
          "Seleccione el periodo"
        ) : !zona ? (
          "Seleccione la Zona"
        ) : (
          "Sin participantes cargados"
        )}
      </div>
      <div className="box box7">
        {participantesDayData.length > 0 ? (
          <BigChartBox
            data={participantesDayData}
            dia={format(day, "dd/MM/yyyy")}
          />
        ) : !day ? (
          "Seleccione la fecha"
        ) : !zona ? (
          "Seleccione la zona"
        ) : (
          "Sin participantes cargados"
        )}
      </div>
    </div>
  );
}
