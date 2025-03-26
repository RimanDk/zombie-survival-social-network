// libs
import {
  Button,
  Dialog,
  SegmentedControl,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { ChangeEvent, useState } from "react";

// internals
import { GenderIndicator, Inventory, LocationEditor } from ".";
import { isSurvivor } from "../helpers";
import { useCreateSurvivor } from "../hooks";
import { useSurvivorStore, useToastsStore } from "../stores";
import { Gender, LatLon, Inventory as TInventory } from "../types";

const DEFAULT_AGE = 18;

export function Register() {
  const identify = useSurvivorStore((state) => state.actions.identify);
  const openToast = useToastsStore((state) => state.actions.openToast);

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

  const { mutate } = useCreateSurvivor({
    onSuccess: (data) => {
      if (isSurvivor(data) && data.name === name && data.id) {
        identify(
          data.id,
          data.name,
          data.lastLocation.latitude,
          data.lastLocation.longitude,
        );
        openToast({
          id: "register-success",
          title: "Welcome!",
          description: "You have been added to the survivor list",
          type: "success",
        });
      }
    },
    onError: () => {
      openToast({
        id: "create-survivor-error",
        title: "Failed to create",
        description: "An error occurred while adding you to the system",
        type: "error",
      });
    },
    onSettled: resetValues,
  });

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
            onClick={() =>
              mutate({
                name,
                age: age!,
                gender: gender!,
                lastLocation: {
                  latitude: latitude!,
                  longitude: longitude!,
                },
                inventory,
              })
            }
          >
            Register
          </Button>
        </Dialog.Close>
      </footer>
    </section>
  );
}
