import {
  Button,
  Dialog,
  Spinner,
  Tabs,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useShallow } from "zustand/react/shallow";

// internals
import { Register, SignIn, UserPanel } from ".";
import { isSurvivor } from "../helpers";
import { useSurvivor } from "../hooks";
import { useSurvivorStore, useToastsStore } from "../stores";

export function UserCenter() {
  const openToast = useToastsStore((state) => state.actions.openToast);

  const { identify, myId, myName, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      identify: state.actions.identify,
      updateInventory: state.actions.updateInventory,
    })),
  );

  const { isFetching } = useSurvivor({
    identifier: myId,
    enabled: !!myId,
    onSuccess: (data) => {
      if (isSurvivor(data) && data.id === myId) {
        identify(
          data.id,
          data.name,
          data.lastLocation.latitude,
          data.lastLocation.longitude,
        );
        updateInventory(data.inventory);
      }
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
