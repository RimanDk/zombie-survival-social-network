import {
  Button,
  Dialog,
  Popover,
  Radio,
  Spinner,
  Tabs,
  Text,
  TextField,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";
// internals
import { useSurvivorStore } from "../stores";
import { ErrorState, Gender, Inventory, LatLon, Survivor } from "../types";
import { isErrorState, isSurvivor } from "../helpers";
import { Toast } from ".";

export function UserCenter() {
  const { myId, myName, identify } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      identify: state.actions.identify,
    })),
  );

  const { isFetching } = useQuery<Survivor | ErrorState>({
    queryKey: ["get-survivor", myId],
    queryFn: () =>
      fetch(`/api/survivors/${myId}`)
        .then((res) => res.json())
        .then((data) => {
          if (isSurvivor(data) && data.id === myId) {
            identify(
              data.id,
              data.name,
              data.lastLocation.latitude,
              data.lastLocation.longitude,
            );
          }
          return data;
        })
        .catch((err) => console.log(err)),
    enabled: !!myId && !myName,
  });

  const [errorToastOpen, setErrorToastOpen] = useState(false);

  if (myId && !myName && isFetching) {
    return (
      <Text color="lime">
        <Spinner />
      </Text>
    );
  }

  if (myId && myName) {
    return (
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="soft">
            <FaRegUser />
            <span>{myName}</span>
          </Button>
        </Popover.Trigger>

        <Popover.Content width="20rem">
          <Popover.Close>
            <Button
              variant="soft"
              color="gray"
              onClick={() => identify(null, null, null, null)}
            >
              Sign out
            </Button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
    );
  }

  return (
    <>
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
                <SignIn openErrorToast={() => setErrorToastOpen(true)} />
              </Tabs.Content>

              <Tabs.Content value="register">
                <Register />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Root>

      <Toast
        open={errorToastOpen}
        onOpenChange={(o) => {
          setErrorToastOpen(o);
        }}
        type="error"
        title="Error"
        titleIcon={<MdError />}
        description="Couldn't find you - are you sure you're in the system?"
      />
    </>
  );
}

interface SignInProps {
  openErrorToast: () => void;
}
function SignIn({ openErrorToast }: SignInProps) {
  const identify = useSurvivorStore((state) => state.actions.identify);

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

function Register() {
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

  const { data: itemsMasterList } = useQuery({
    queryKey: ["get-items"],
    queryFn: () =>
      fetch("/api/items/")
        .then((res) => res.json())
        .catch((err) => console.log(err)),
  });

  const mutation = useMutation({
    mutationFn: (data: Survivor) =>
      fetch("/api/survivors/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .catch((err) => console.log(err)),
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
                await mutation.mutate(
                  {
                    name,
                    age: age!,
                    gender: gender!,
                    lastLocation: {
                      latitude: latitude!,
                      longitude: longitude!,
                    },
                    inventory,
                  },
                  {
                    onSuccess: (data) => {
                      if (isSurvivor(data) && data.name === name && data.id) {
                        identify(
                          data.id,
                          data.name,
                          data.lastLocation.latitude,
                          data.lastLocation.longitude,
                        );
                      }
                    },
                    onSettled: resetValues,
                  },
                );
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
