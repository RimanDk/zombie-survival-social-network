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
import { useSurvivorStore } from "../stores";

export function UserCenter() {
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
