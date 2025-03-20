// libs
import { Button, Popover, Separator } from "@radix-ui/themes";
import { FaRegUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

// internals
import { useSurvivorStore } from "../stores";
import { Inventory, LocationEditor } from ".";

export function UserPanel() {
  const { myName, myInventory, identify } = useSurvivorStore(
    useShallow((state) => ({
      myName: state.name,
      myInventory: state.inventory,
      identify: state.actions.identify,
    })),
  );

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft">
          <FaRegUser />
          <span>{myName}</span>
        </Button>
      </Popover.Trigger>

      <Popover.Content width="20rem">
        <div className="flex flex-col gap-3">
          <Inventory items={myInventory} grid />

          <Separator size="4" />

          <LocationEditor />

          <Separator size="4" />

          <footer className="flex justify-end">
            <Popover.Close>
              <Button
                variant="soft"
                color="gray"
                onClick={() => identify(null, null, null, null)}
              >
                <MdLogout />
                Sign out
              </Button>
            </Popover.Close>
          </footer>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
