import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "hooks";
import { format } from "date-fns";
import { useDay, useRange, useZona } from "hooks/dashboard";
import { getResumenParticipantes, getResumenVentas } from "apis/dashboard";
import BigChartBoxRange from "../bigChartBox/BigChartBox";
import BigChartBox from "../bigChartBoxRange/BigChartBoxRange";
import ChartBox from "../chartBox/ChartBox";
import PieChartBox from "../pieCartBox/PieChartBox";
import PieChartBoxImportes from "../pieCartBoxImportes/PieChartBoxImportes";
import "./home.scss";
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
async function participantes(params, desde, hasta) {
  const resumenPeriodo = await getResumenParticipantes(params, desde, hasta);
  return resumenPeriodo;
}
async function ventas(params, desde, hasta) {
  return await getResumenVentas(params, desde, hasta);
}
function useVentas(desde, hasta, filter, attr) {
  const params = useParams();
  const ventasData = useAsync(
    () => ventas(params, desde, hasta),
    [params, desde, hasta],
    desde === hasta
  );
  return useMemo(() => {
    const res = [];
    if (ventasData.result) {
      const g = groupBy(ventasData.result, filter);
      for (const k in g) {
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
  const filter = (d) => format(new Date(d.FechaReservaInicio), "dd/MM/yyyy");
  return useVentas(desde, hasta, filter, "Operaciones");
}
function useImportes(desde, hasta) {
  const filter = (d) => format(new Date(d.FechaReservaInicio), "dd/MM/yyyy");
  return useVentas(desde, hasta, filter, "ImporteTotal");
}
function useParticipantes(zona, desde, hasta, filter) {
  const params = useParams();
  const reduceReservados = (p, c) => p + c.Participantes;
  const reduceCargados = (p, c) => p + c.IntegrantesCargados;
  const reduceCheckIns = (p, c) => p + c.IntegrantesCargadosConCheckIn;
  const participantesRangeData = useAsync(
    () => participantes(params, desde, hasta),
    [params, desde, hasta],
    desde === hasta
  );
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
  const importesTotal = useMemo(
    () => importes.reduce((p, c) => p + c.web + c.local, 0),
    [importes]
  );
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
