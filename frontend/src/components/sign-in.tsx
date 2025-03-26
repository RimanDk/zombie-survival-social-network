// libs
import { Button, Dialog, TextField } from "@radix-ui/themes";
import { ChangeEvent, useState } from "react";
import { useShallow } from "zustand/react/shallow";

// internals
import { isSurvivor } from "../helpers";
import { useSurvivor } from "../hooks";
import { useSurvivorStore, useToastsStore } from "../stores";

export function SignIn() {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { identify, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      identify: state.actions.identify,
      updateInventory: state.actions.updateInventory,
    })),
  );

  const [name, setName] = useState("");

  const { isFetching, refetch } = useSurvivor({
    identifier: name,
    enabled: false,
    onSuccess: (data) => {
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
    },
    onError: (err) => {
      if (err.message === "Not Found") {
        openToast({
          id: "loadprofile-not-fount",
          title: "Error",
          description: "Could not find survivor in the system",
          type: "error",
        });
        return;
      } else if (err.message.includes("Unexpected token")) {
        openToast({
          id: "loadprofile-data-corrupted",
          title: "Error",
          description: "Survivor data is corrupted",
          type: "error",
        });
        return;
      }
      openToast({
        id: "loadprofile-error",
        title: "Error",
        description: "An error occurred while loading survivor",
        type: "error",
      });
    },
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
            onClick={() => refetch()}
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
