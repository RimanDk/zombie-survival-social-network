import {
  Button,
  Dialog,
  Spinner,
  Tabs,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

// internals
import { Register, SignIn, UserPanel } from ".";
import { isSurvivor } from "../helpers";
import { Toast, useSurvivorStore, useToastsStore } from "../stores";
import { ErrorState, Survivor } from "../types";

const TOASTS: Record<string, Toast> = {
  "loadprofile-not-fount": {
    title: "Error",
    description: "Could not find your profile in the system",
    type: "error",
    open: false,
  },
  "loadprofile-error": {
    title: "Error",
    description: "An error occurred while loading your profile",
    type: "error",
    open: false,
  },
  "loadprofile-data-corrupted": {
    title: "Error",
    description: "Your profile data is corrupted",
    type: "error",
    open: false,
  },
};

export function UserCenter() {
  const { myId, myName, identify, updateInventory } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
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

  const { isFetching } = useQuery<Survivor | ErrorState>({
    queryKey: ["get-survivor", myId],
    queryFn: async () => {
      const response = await fetch(`/api/survivors/${myId}`);

      if (!response.ok) {
        if (response.status === 404) {
          openToast("loadprofile-not-fount");
          throw new Error("Not found");
        }
        openToast("loadprofile-error");
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
        openToast("loadprofile-data-corrupted");
        throw err;
      }
    },
    enabled: !!myId,
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
