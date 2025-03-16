// libs
import { useEffect, useState } from "react";

// internals
import { SurvivorCard } from "./components";
import { MOCK_SURVIVORS } from "./constants";
import { Survivor } from "./types";

export function App() {
  const [survivors, setSurvivors] = useState<Survivor[]>([]);

  useEffect(() => {
    setSurvivors(MOCK_SURVIVORS);
  }, []);

  return (
    <div>
      <header className="pb-2">
        <h1 className="font-brand text-3xl">Zombie Survival Social Network</h1>
      </header>
      <section>
        <h3 className="font-brand text-xl">Known survivors</h3>
        <ul className="flex flex-col gap-2">
          {survivors.map((survivor) => (
            <li key={survivor.id}>
              <SurvivorCard survivor={survivor} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
