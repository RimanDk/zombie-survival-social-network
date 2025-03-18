// libs
import { useQuery } from "@tanstack/react-query";

// internals
import { UserCenter, SurvivorCard } from "./components";
import { Item, Survivor } from "./types";
import { useSurvivorStore } from "./stores";

export function App() {
  const myId = useSurvivorStore((state) => state.id);

  const { error: itemsMasterListError } = useQuery<Item[]>({
    queryKey: ["get-items"],
    queryFn: () =>
      fetch("/api/items/")
        .then((res) => res.json())
        .catch((err) => console.log(err)),
  });

  const { data: survivors } = useQuery<Survivor[]>({
    queryKey: ["get-survivors", myId],
    queryFn: () => {
      const headers = new Headers();
      if (myId) {
        headers.append("X-User-Id", myId);
      }
      return fetch("/api/survivors/", {
        method: "GET",
        headers,
      })
        .then((res) => res.json())
        .catch((err) => console.log(err));
    },
  });

  if (itemsMasterListError) {
    return null;
  }

  return (
    <div className="p-6">
      <header className="flex justify-between">
        <h1 className="font-brand text-3xl">Zombie Survival Social Network</h1>
        <UserCenter />
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
