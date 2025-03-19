// libs
import { useQuery } from "@tanstack/react-query";
import { IconButton, TextField } from "@radix-ui/themes";
import { ChangeEvent } from "react";

// internals
import { Item, Inventory as TInventory } from "../types";
import { FaMinus, FaPlus } from "react-icons/fa";

interface InventoryProps {
  items: TInventory;
  setInventory?: (inventory: TInventory) => void;
}
export function Inventory({ items, setInventory }: InventoryProps) {
  const { data: possibleItems } = useQuery<Item[]>({
    queryKey: ["get-items"],
    queryFn: async () => {
      const response = await fetch("/api/items/");

      if (!response.ok) {
        throw new Error("An error occurred");
      }
      return await response.json();
    },
  });

  return (
    <>
      <fieldset className="flex flex-col gap-1.5">
        <p className="text-lime-500">Inventory</p>
        {(possibleItems ?? []).map((item) => (
          <div key={item.id} className="grid grid-cols-2 items-center gap-2">
            <span className="text-sm">{item.label}</span>
            <div className="flex items-center gap-3">
              {setInventory && (
                <IconButton
                  color="gray"
                  variant="ghost"
                  size="1"
                  className="group"
                  onClick={() => {
                    const newValue = (items[item.id] ?? 0) - 1;
                    setInventory({
                      ...items,
                      [item.id]: newValue < 0 ? 0 : newValue,
                    });
                  }}
                >
                  <FaMinus className="text-sm group-hover:text-lime-500" />
                </IconButton>
              )}
              <TextField.Root
                type="number"
                value={items[item.id] ?? 0}
                disabled={!setInventory}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value)) {
                    return;
                  }
                  setInventory!({
                    ...items,
                    [item.id]: value < 0 ? 0 : value,
                  });
                }}
              />
              {setInventory && (
                <IconButton
                  color="gray"
                  variant="ghost"
                  size="1"
                  className="group"
                  onClick={() => {
                    setInventory({
                      ...items,
                      [item.id]: (items[item.id] ?? 0) + 1,
                    });
                  }}
                >
                  <FaPlus className="text-sm group-hover:text-lime-500" />
                </IconButton>
              )}
            </div>
          </div>
        ))}
      </fieldset>
    </>
  );
}
