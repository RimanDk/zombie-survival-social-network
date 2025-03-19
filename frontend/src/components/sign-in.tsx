// libs
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useShallow } from "zustand/react/shallow";

// internals
import { isErrorState, isSurvivor } from "../helpers";
import { useSurvivorStore } from "../stores";
import { ErrorState, Survivor } from "../types";

interface SignInProps {
  openErrorToast: () => void;
}
export function SignIn({ openErrorToast }: SignInProps) {
  const { identify, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      identify: state.actions.identify,
      updateInventory: state.actions.updateInventory,
    })),
  );

  const [name, setName] = useState("");

  const { refetch, isFetching } = useQuery<Survivor | ErrorState>({
    queryKey: ["get-survivor", name],
    queryFn: () =>
      fetch(`/api/survivors/${name}`)
        .then((res) => res.json())
        .catch((err) => console.log(err)),
    enabled: false,
  });

  return (
    <section className="flex flex-col gap-3">
      <Dialog.Description size="2">
        Welcome back! Let's get you signed in
      </Dialog.Description>

      <label>
        <span>What's your name?</span>
        <TextField.Root
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="John Doe"
        />
      </label>

      <footer className="flex justify-between">
        <Dialog.Close>
          <Button
            variant="soft"
            color="gray"
            onClick={() => {
              setName("");
            }}
          >
            Cancel
          </Button>
        </Dialog.Close>
        <Dialog.Close>
          <Button
            onClick={async () => {
              const { data } = await refetch();
              if (
                isSurvivor(data) &&
                data.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
                data.id
              ) {
                identify(
                  data.id,
                  data.name,
                  data.lastLocation.latitude,
                  data.lastLocation.longitude,
                );
                updateInventory(data.inventory);
              }

              if (isErrorState(data)) {
                openErrorToast();
              }

              setName("");
            }}
            disabled={name === ""}
            loading={name !== "" && isFetching}
          >
            Sign in
          </Button>
        </Dialog.Close>
      </footer>
    </section>
  );
}
