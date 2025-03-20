// libs
import { IconButton, TextField } from "@radix-ui/themes";
import classNames from "classnames";
import { ChangeEvent } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

// internals
import { useItems } from "../hooks";
import { Inventory as TInventory } from "../types";

interface InventoryProps {
  items: TInventory;
  ceilings?: TInventory;
  title?: string;
  centralizeTitle?: boolean;
  omitLabels?: boolean;
  grid?: boolean;
  rowOrientation?: "ltr" | "rtl";
  setInventory?: (inventory: TInventory) => void;
}
export function Inventory({
  items,
  ceilings,
  title = "Inventory",
  centralizeTitle = false,
  omitLabels = false,
  rowOrientation = "ltr",
  grid = false,
  setInventory,
}: InventoryProps) {
  const possibleItems = useItems();

  return (
    <>
      <fieldset
        className={classNames("gap-1.5", {
          "flex flex-col": !grid,
          "grid grid-cols-2": grid,
        })}
      >
        <p
          className={classNames("text-lime-500", {
            "text-center": centralizeTitle,
            "col-span-2": grid,
          })}
        >
          {title}
        </p>
        {(possibleItems ?? []).map((item) => (
          <div
            key={item.id}
            className={classNames("flex items-center gap-2", {
              "xs:flex-row-reverse": rowOrientation === "rtl",
            })}
          >
            {!omitLabels && (
              <span
                className={classNames("w-full text-sm", {
                  "xs:hidden": rowOrientation === "rtl",
                  "min-w-25": !grid,
                  "min-w-20": grid,
                })}
              >
                {item.label}
              </span>
            )}
            <div className="flex items-center gap-3">
              {setInventory && (
                <IconButton
                  color="gray"
                  variant="ghost"
                  size="1"
                  disabled={!items[item.id]}
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
                className="w-10"
                value={items[item.id] ?? 0}
                disabled={!setInventory}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value)) {
                    return;
                  }
                  if (ceilings && value > ceilings[item.id]) {
                    setInventory!({
                      ...items,
                      [item.id]: ceilings[item.id],
                    });
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
                  disabled={
                    ceilings &&
                    (items[item.id] ?? 0) >= (ceilings[item.id] ?? 0)
                  }
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
