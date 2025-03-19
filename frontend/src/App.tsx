// libs
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// internals
import { DistanceFilter, UserCenter, SurvivorCard } from "./components";
import { Item, Survivor } from "./types";
import { useSurvivorStore } from "./stores";

export function App() {
  const myId = useSurvivorStore((state) => state.id);
  const [maxDistance, setMaxDistance] = useState<number | undefined>();

  const { error: itemsMasterListError } = useQuery<Item[]>({
    queryKey: ["get-items"],
    queryFn: async () => {
      const response = await fetch("/api/items/");

      if (!response.ok) {
        throw new Error("An error occurred");
      }
      return await response.json();
    },
  });

  const { data: survivors } = useQuery<Survivor[]>({
    queryKey: ["get-survivors", myId, maxDistance],
    queryFn: async () => {
      const headers = new Headers();
      if (myId) {
        headers.append("X-User-Id", myId);
      }

      const search = new URLSearchParams();
      if (maxDistance) {
        search.append("max_distance", `${maxDistance}`);
      }

      const response = await fetch(`/api/survivors/?${search.toString()}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("An error occurred");
      }

      return await response.json();
    },
  });

  if (itemsMasterListError) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-4 flex justify-between sm:mb-8">
        <h1 className="font-brand text-2xl text-balance sm:text-3xl">
          Zombie Survival Social Network
        </h1>
        <UserCenter />
      </header>

      <section>
        <div
          className="sticky top-0 py-3"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div
            className="flex flex-col gap-2 rounded p-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: "var(--accent-5)" }}
          >
            <h3 className="text-lg leading-5 sm:text-xl">Known survivors</h3>
            <DistanceFilter
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
            />
          </div>
        </div>

        {!!survivors?.length && (
          <ul className="xs:grid-cols-2 xs:gap-1.5 grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 lg:grid-cols-5">
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
