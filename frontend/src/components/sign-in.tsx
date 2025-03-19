// libs
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useShallow } from "zustand/react/shallow";

// internals
import { isSurvivor } from "../helpers";
import { Toast, useSurvivorStore, useToastsStore } from "../stores";
import { ErrorState, Survivor } from "../types";

const TOASTS: Record<string, Toast> = {
  "signin-not-fount": {
    title: "Error",
    description: "Could not find anyone in the system with that name",
    type: "error",
    open: false,
  },
  "signin-error": {
    title: "Error",
    description: "An error occurred while signing in",
    type: "error",
    open: false,
  },
  "signin-data-corrupted": {
    title: "Error",
    description: "Your profile data is corrupted",
    type: "error",
    open: false,
  },
};

export function SignIn() {
  const { identify, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      identify: state.actions.identify,
      updateInventory: state.actions.updateInventory,
    })),
  );

  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const [name, setName] = useState("");

  const { refetch, isFetching } = useQuery<Survivor | ErrorState>({
    queryKey: ["get-survivor", name],
    queryFn: async () => {
      const response = await fetch(`/api/survivors/${name}`);

      if (!response.ok) {
        if (response.status === 404) {
          openToast("signin-not-fount");
          throw new Error("Not found");
        }
        openToast("signin-error");
        throw new Error("An error occurred");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast("signin-data-corrupted");
        throw err;
      }
    },
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
