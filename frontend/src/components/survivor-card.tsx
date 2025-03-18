import { InfectionReport, Survivor } from "../types";

interface SurvivorCardProps {
  survivor: Survivor;
}
export function SurvivorCard({ survivor }: SurvivorCardProps) {
  return (
    <section className="grid grid-cols-5 items-center">
      <p>{survivor.name}</p>
      <p>{survivor.age}</p>
      <p>{survivor.gender}</p>
      <p>{survivor.lastLocation.distance}</p>
      <InfectionReportGauge reports={survivor.infectionReports ?? []} />
    </section>
  );
}

interface InfectionReportGaugeProps {
  reports: InfectionReport[];
}
function InfectionReportGauge({ reports }: InfectionReportGaugeProps) {
  return (
    <ul>
      {reports.map(({ id }) => (
        <li
          key={id}
          className="h-1.5 w-1.5 rounded border border-red-500 bg-red-500"
        />
      ))}
    </ul>
  );
}
