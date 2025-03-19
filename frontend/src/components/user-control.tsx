import {
  Button,
  Dialog,
  Spinner,
  Tabs,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { MdError } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

// internals
import { useSurvivorStore } from "../stores";
import { ErrorState, Survivor } from "../types";
import { isSurvivor } from "../helpers";
import { Register, SignIn, Toast, UserPanel } from ".";

export function UserCenter() {
  const { myId, myName, identify, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      identify: state.actions.identify,
      updateInventory: state.actions.updateInventory,
    })),
  );

  const queryFn = useCallback(async () => {
    const response = await fetch(`/api/survivors/${myId}`);

    if (!response.ok) {
      throw new Error("An error occurred");
    }
    try {
      const data = await response.json();
      if (isSurvivor(data) && data.id === myId) {
        identify(
          data.id,
          data.name,
          data.lastLocation.latitude,
          data.lastLocation.longitude,
        );
        updateInventory(data.inventory);
      }
      return data;
    } catch (err) {
      console.error(err);
      throw new Error("An error occurred parsing response");
    }
  }, [myId, identify, updateInventory]);

  const { isFetching } = useQuery<Survivor | ErrorState>({
    queryKey: ["get-survivor", myId],
    queryFn,
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
    return <UserPanel />;
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
