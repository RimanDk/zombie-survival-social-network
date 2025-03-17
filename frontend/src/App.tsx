// libs
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// internals
import { IdentifySelfModal, SurvivorCard } from "./components";
import { MOCK_SURVIVORS } from "./constants";
import { Item, Survivor } from "./types";
import { useSurvivorStore } from "./stores";

export function App() {
  const { data: itemsMasterList, error: itemsMasterListError } = useQuery<
    Item[]
  >({
    queryKey: ["get-items"],
    queryFn: () =>
      fetch("/api/items/")
        .then((res) => res.json())
        .catch((err) => console.log(err)),
  });

  const { data: survivors } = useQuery<Survivor[]>({
    queryKey: ["get-survivors"],
    queryFn: () =>
      fetch("/api/survivors/")
        .then((res) => res.json())
        .catch((err) => console.log(err)),
  });

  if (itemsMasterListError) {
    return null;
  }

  return (
    <div className="p-6">
      <header className="flex justify-between">
        <h1 className="font-brand text-3xl">Zombie Survival Social Network</h1>
        <IdentifySelfModal />
      </header>
      <section>
        <h3 className="font-brand text-xl">Known survivors</h3>
        {!!survivors?.length && (
          <ul className="flex flex-col gap-2">
            {survivors.map((survivor) => (
              <li key={survivor.id}>
                <SurvivorCard survivor={survivor} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
