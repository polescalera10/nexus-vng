import { Reveal } from "@/components/ui/Reveal";
import { diasSemana, familiaColor, horarioRegular } from "@/content/horario-regular";

/**
 * Parrilla semanal del curso regular (temporada 26·27).
 *
 * Fuente única: el cartel oficial en `content/horario-regular.ts`. Se usa en
 * `/horarios` (página dedicada) y está pensado para sustituir también la tabla
 * inline de `/clases`, que hoy repite este mismo marcado.
 *
 * La rejilla no cabe en móvil: se desplaza en horizontal DENTRO de su caja,
 * nunca la página (regla mobile-first del proyecto). `tabIndex` la hace
 * accesible por teclado.
 */
export function HorarioSemanal({ leyenda = true }: { leyenda?: boolean }) {
  return (
    <div className="space-y-6">
      <p className="font-body text-text-faint text-[13px] md:hidden" aria-hidden="true">
        Desliza la tabla para ver toda la semana →
      </p>

      <Reveal
        className="focus-visible:outline-neon overflow-x-auto"
        role="region"
        aria-label="Horario semanal de clases"
        tabIndex={0}
      >
        <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-2">
          <caption className="sr-only">
            Horario del curso regular de NEXUS VNG en Vilanova i la Geltrú, temporada 26·27, de
            lunes a viernes.
          </caption>
          <thead>
            <tr>
              <th className="font-body text-text-faint w-[68px] px-2 py-2 text-left text-[11px] font-bold tracking-wider uppercase">
                Hora
              </th>
              {diasSemana.map((dia) => (
                <th
                  key={dia}
                  scope="col"
                  className="bg-bg-elevated font-display text-text-strong rounded-sm px-3 py-2 text-center text-base"
                >
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarioRegular.map((franja) => (
              <tr key={franja.hora}>
                <th
                  scope="row"
                  className="font-display text-text-muted px-2 py-2 text-left align-middle text-lg font-normal"
                >
                  {franja.hora}
                </th>
                {franja.clases.map((clase, i) => (
                  <td key={i} className="align-top">
                    {clase ? (
                      <div className="bg-bg-panel hover:border-neon/30 flex h-full min-h-[66px] flex-col rounded-sm border border-white/8 px-3 py-3 transition-colors">
                        <p
                          className={`font-body text-sm leading-tight font-bold ${familiaColor[clase.familia]}`}
                        >
                          {clase.estilo}
                        </p>
                        <p className="font-body text-text-muted mt-1 text-[12px]">{clase.profes}</p>
                      </div>
                    ) : (
                      <div className="h-full min-h-[66px] rounded-sm border border-dashed border-white/5" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {leyenda && (
        <Reveal>
          <p className="font-body text-text-faint text-[13px]">
            El número indica el nivel: <strong className="text-text-muted">0</strong> desde cero
            absoluto, <strong className="text-text-muted">1</strong> iniciación,{" "}
            <strong className="text-text-muted">2</strong> intermedio. Los grupos{" "}
            <strong className="text-text-muted">Cía</strong> son de compañía: montaje coreográfico
            y actuaciones, con la misma tarifa que el resto. ¿No ves tu hueco? Escríbenos y lo
            encontramos.
          </p>
        </Reveal>
      )}
    </div>
  );
}
