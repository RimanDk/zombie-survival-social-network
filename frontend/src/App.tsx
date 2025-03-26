// internals
import {
  DistanceFilter,
  SurvivorCard,
  ToastEngine,
  UserCenter,
} from "./components";
import { useSurvivors } from "./hooks";
import { useSearchStore, useSurvivorStore, useToastsStore } from "./stores";

export function App() {
  const myId = useSurvivorStore((state) => state.id);
  const maxDistance = useSearchStore((state) => state.maxDistance);
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { data: survivors } = useSurvivors({
    identifier: myId,
    maxDistance,
    onError: (err) => {
      if (err.message.includes("Unexpected token")) {
        openToast({
          id: "load-survivors-data-corrupted",
          title: "Error",
          description: "Survivors data is corrupted",
          type: "error",
        });
        return;
      }
      openToast({
        id: "load-survivors-error",
        title: "Error",
        description: "An error occurred while loading survivors",
        type: "error",
      });
    },
  });

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
          className="sticky top-0 z-10 py-2"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div
            className="my-3 flex flex-col gap-2 rounded p-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: "var(--accent-5)" }}
          >
            <h3 className="text-lg leading-5 sm:text-xl">Known survivors</h3>
            <DistanceFilter />
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

      <ToastEngine />
    </div>
  );
}
