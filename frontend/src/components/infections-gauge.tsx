// libs
import { FaVirus, FaVirusSlash } from "react-icons/fa";

// internals
import { InfectionReport } from "../types";

interface InfectionReportGaugeProps {
  reports: InfectionReport[];
}
export function InfectionReportGauge({ reports }: InfectionReportGaugeProps) {
  return (
    <div className="flex items-center gap-3">
      {reports.length ?
        <FaVirus className="text-lime-500" />
      : <FaVirusSlash className="text-lime-500/50" />}
      <ul className="flex items-center gap-1">
        {reports.map(({ id }) => (
          <li key={id} className="h-1.5 w-1.5 rounded-full bg-red-500" />
        ))}
      </ul>
    </div>
  );
}
