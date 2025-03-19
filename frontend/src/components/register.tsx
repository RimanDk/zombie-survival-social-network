// libs
import { Button, Dialog, Radio, TextField } from "@radix-ui/themes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

// internals
import { isSurvivor } from "../helpers";
import { useSurvivorStore } from "../stores";
import { Gender, Inventory, LatLon, Survivor } from "../types";
import { ToastEngine, ToastsConfig } from ".";

export function Register() {
  const identify = useSurvivorStore((state) => state.actions.identify);

  const [name, setName] = useState("");
  const [age, setAge] = useState<number>();
  const [gender, setGender] = useState<Gender>();
  const [latitude, setLatitude] = useState<LatLon["latitude"]>();
  const [longitude, setLongitude] = useState<LatLon["longitude"]>();
  const [inventory, setInventory] = useState<Inventory>({});

  const resetValues = () => {
    setName("");
    setAge(undefined);
    setGender(undefined);
    setLatitude(undefined);
    setLongitude(undefined);
    setInventory({});
  };

  const queryFn = useCallback(async () => {
    const response = await fetch("/api/items/");
    if (!response.ok) {
      throw new Error("An error occurred");
    }
    return response.json();
  }, []);

  const { data: itemsMasterList } = useQuery({
    queryKey: ["get-items"],
    queryFn,
  });

  const mutationFn = useCallback(async (data: Survivor) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const response = await fetch("/api/survivors/", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail ?? "An error occurred");
    }
    return response.json();
  }, []);

  const mutation = useMutation({
    mutationFn,
    onError: () => {
      setOpenToasts(["registration-error"]);
    },
    onSuccess: (data) => {
      if (isSurvivor(data) && data.name === name && data.id) {
        identify(
          data.id,
          data.name,
          data.lastLocation.latitude,
          data.lastLocation.longitude,
        );
      }
      setOpenToasts(["registration-success"]);
    },
    onSettled: resetValues,
  });

  const toasts = useMemo(
    () => ({
      "registration-success": {
        title: "Welcome!",
        description: "You have been added to the system!",
        type: "success",
      },
      "registration-error": {
        title: "Failed to create",
        description: "An error occurred while adding you to the system",
        type: "error",
      },
    }),
    [],
  );
  const [openToasts, setOpenToasts] = useState<(keyof typeof toasts)[]>([]);

  return (
    <section className="flex flex-col gap-3">
      <Dialog.Description size="2">
        Welcome! Let's get you registered
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

      <label>
        <span>How old are you?</span>
        <TextField.Root
          value={age}
          type="number"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAge(parseInt(e.target.value))
          }
          placeholder="30"
        />
      </label>

      <span>What's your gender?</span>
      <label className="flex items-center gap-2">
        <Radio
          name="gender"
          value="m"
          onChange={() => {
            setGender("m");
          }}
          checked={gender === "m"}
        />
        <span>Male</span>
      </label>
      <label className="flex items-center gap-2">
        <Radio
          name="gender"
          value="f"
          onChange={() => {
            setGender("f");
          }}
          checked={gender === "f"}
        />
        <span>Female</span>
      </label>

      <div>
        <span>Where are you located?</span>
        <div className="flex gap-2">
          <TextField.Root
            value={latitude}
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLatitude(parseFloat(e.target.value))
            }
            placeholder="Latitude"
          />
          <TextField.Root
            value={longitude}
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLongitude(parseFloat(e.target.value))
            }
            placeholder="Longitude"
          />
        </div>

        <div>
          <span>What's in your inventory?</span>
          <div className="flex flex-col gap-2">
            {itemsMasterList?.map((item: { id: string; label: string }) => (
              <label key={item.id} className="flex items-center gap-2">
                <TextField.Root
                  value={inventory[item.id]}
                  type="number"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInventory({
                      ...inventory,
                      [item.id]: parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <footer className="flex justify-between">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={resetValues}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              disabled={!name || !age || !gender || !latitude || !longitude}
              onClick={async () => {
                await mutation.mutate({
                  name,
                  age: age!,
                  gender: gender!,
                  lastLocation: {
                    latitude: latitude!,
                    longitude: longitude!,
                  },
                  inventory,
                });
              }}
            >
              Register
            </Button>
          </Dialog.Close>
        </footer>
      </div>

      <ToastEngine toasts={toasts as ToastsConfig} openToasts={openToasts} />
    </section>
  );
}
