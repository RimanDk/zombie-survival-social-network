import {
  Button,
  Callout,
  Dialog,
  Radio,
  Tabs,
  Text,
  TextField,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { MdError } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";
// internals
import { useSurvivorStore } from "../stores";
import { Gender, Inventory, LatLon, Survivor } from "../types";

export function IdentifySelfModal() {
  const { myId, myName } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      identify: state.actions.identify,
    })),
  );

  if (myId && myName) {
    return (
      <div className="flex gap-2">
        <span>Hello,</span>
        <Text color="lime">{myName}</Text>
      </div>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="classic">Sign in</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="20rem" className="!p-0">
        <VisuallyHidden>
          <Dialog.Title>Sign in or register</Dialog.Title>
        </VisuallyHidden>

        <Tabs.Root defaultValue="sign-in">
          <Tabs.List>
            <Tabs.Trigger value="sign-in">Sign in</Tabs.Trigger>
            <Tabs.Trigger value="register">Register</Tabs.Trigger>
          </Tabs.List>

          <div className="p-6">
            <Tabs.Content value="sign-in">
              <SignIn />
            </Tabs.Content>

            <Tabs.Content value="register">
              <Register />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function SignIn() {
  const identify = useSurvivorStore((state) => state.actions.identify);

  const [name, setName] = useState("");

  const { refetch, data, isFetching } = useQuery({
    queryKey: ["get-survivor", name],
    queryFn: () =>
      fetch(`/api/survivors/${name}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name === name && data.id) {
            identify(data.id, data.name);
          }
          return data;
        }),
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

      {data?.detail === "Not Found" && (
        <Callout.Root variant="soft">
          <Callout.Icon>
            <MdError />
          </Callout.Icon>
          <Callout.Text>
            Couldn't find you - are you sure you're in the system?
          </Callout.Text>
        </Callout.Root>
      )}

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
              await refetch();
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

function Register() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>();
  const [gender, setGender] = useState<Gender>();
  const [latitude, setLatitude] = useState<LatLon["latitude"]>("");
  const [longitude, setLongitude] = useState<LatLon["longitude"]>("");
  const [inventory, setInventory] = useState<Inventory>({});

  const resetValues = () => {
    setName("");
    setAge(undefined);
    setGender(undefined);
    setLatitude("");
    setLongitude("");
    setInventory({});
  };

  const { data: itemsMasterList } = useQuery({
    queryKey: ["get-items"],
    queryFn: () =>
      fetch("/api/items/")
        .then((res) => res.json())
        .catch((err) => console.log(err)),
  });

  const register = useMutation({
    mutationFn: (data: Survivor) =>
      fetch("/api/survivors/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
  });

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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLatitude(e.target.value)
            }
            placeholder="Latitude"
          />
          <TextField.Root
            value={longitude}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLongitude(e.target.value)
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
              onClick={async () => {
                console.info(
                  "registering",
                  name,
                  age,
                  gender,
                  latitude,
                  longitude,
                  inventory,
                );
                await register.mutate({
                  name,
                  age: age!,
                  gender: gender!,
                  lastLocation: { latitude, longitude },
                  inventory,
                });
                resetValues();
              }}
            >
              Register
            </Button>
          </Dialog.Close>
        </footer>
      </div>
    </section>
  );
}
