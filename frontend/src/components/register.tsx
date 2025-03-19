// libs
import {
  Button,
  Dialog,
  SegmentedControl,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

// internals
import { isSurvivor } from "../helpers";
import { useSurvivorStore } from "../stores";
import { Gender, Inventory as TInventory, LatLon, Survivor } from "../types";
import {
  GenderIndicator,
  Inventory,
  LocationEditor,
  ToastEngine,
  ToastsConfig,
} from ".";

const DEFAULT_AGE = 18;

export function Register() {
  const identify = useSurvivorStore((state) => state.actions.identify);

  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(DEFAULT_AGE);
  const [gender, setGender] = useState<Gender>();
  const [latitude, setLatitude] = useState<LatLon["latitude"]>();
  const [longitude, setLongitude] = useState<LatLon["longitude"]>();
  const [inventory, setInventory] = useState<TInventory>({});

  const resetValues = () => {
    setName("");
    setAge(DEFAULT_AGE);
    setGender(undefined);
    setLatitude(undefined);
    setLongitude(undefined);
    setInventory({});
  };

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
    <section className="flex flex-col gap-3 text-balance">
      <Dialog.Description size="2">
        Welcome! Let's get you registered! Tell us about yourself
      </Dialog.Description>

      <fieldset>
        <legend className="text-lime-500">Personal Information</legend>

        <div className="grid grid-cols-[70%_auto] gap-2 pb-2">
          <label>
            <span className="text-sm">Name</span>
            <TextField.Root
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="John Doe"
            />
          </label>

          <label>
            <span className="text-sm">Age</span>
            <TextField.Root
              value={age}
              type="number"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const newAge = parseInt(e.target.value);
                setAge(newAge < 0 ? 0 : newAge);
              }}
              placeholder={DEFAULT_AGE.toString()}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Gender</span>
          <SegmentedControl.Root
            onValueChange={(val) => {
              setGender(val as Gender);
            }}
            size="2"
          >
            <SegmentedControl.Item value="m">
              <GenderIndicator gender="m" />
            </SegmentedControl.Item>
            <SegmentedControl.Item value="f">
              <GenderIndicator gender="f" />
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
      </fieldset>

      <Separator size="4" />

      <LocationEditor
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
      />

      <Separator size="4" />

      <Inventory items={inventory} setInventory={setInventory} />

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

      <ToastEngine toasts={toasts as ToastsConfig} openToasts={openToasts} />
    </section>
  );
}
