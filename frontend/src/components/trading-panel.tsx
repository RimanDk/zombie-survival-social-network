// libs
import { useShallow } from "zustand/react/shallow";
import { Inventory } from "./inventory";

// internals
import { useSurvivorStore } from "../stores";
import { Inventory as TInventory, Survivor } from "../types";
import { Button, Dialog } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { useItems } from "../hooks";

interface TradingPanelProps {
  tradingPartner: Survivor;
}
export function TradingPanel({ tradingPartner }: TradingPanelProps) {
  const { myId, myInventory } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myInventory: state.inventory,
    })),
  );

  const possibleItems = useItems();

  const emptyOffer = useMemo(
    () =>
      (possibleItems ?? []).reduce<TInventory>((acc, item) => {
        acc[item.id] = 0;
        return acc;
      }, {}),
    [possibleItems],
  );

  const [myTempInventory, setMyTempInventory] = useState<TInventory>({
    ...myInventory,
  });
  const [myOffer, setMyOffer] = useState<TInventory>();
  const [theirInventory, setTheirInventory] = useState<TInventory>({
    ...tradingPartner.inventory,
  });
  const [theirOffer, setTheirOffer] = useState<TInventory>();

  const getUpdatedInventory = (inventory: TInventory, offer: TInventory) => {
    const update = { ...emptyOffer };
    for (const key in offer) {
      update[key] = inventory[key] - offer[key];
    }
    return update;
  };

  return (
    <Dialog.Content>
      <Dialog.Title>Trade with {tradingPartner.name}</Dialog.Title>
      <Dialog.Description>
        Here, you can trade items with {tradingPartner.name}. The net value of
        the trade needs to be equal on both sides of the table.
      </Dialog.Description>

      <div className="xs:grid-cols-[60%_40%] grid grid-cols-1 gap-4 pt-4">
        <section className="flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-950/80 p-4">
          <p className="col-span-2 text-center font-semibold text-lime-500">
            Me
          </p>
          <div className="flex justify-between">
            <Inventory items={myTempInventory} title="Inventory" />
            <Inventory
              items={myOffer ?? { ...emptyOffer }}
              ceilings={myInventory}
              title="Offer"
              centralizeTitle
              omitLabels
              setInventory={(offer) => {
                setMyOffer({ ...offer });
                setMyTempInventory(getUpdatedInventory(myInventory, offer));
              }}
            />
          </div>
        </section>
        <section className="flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-950/80 p-4">
          <p className="col-span-2 text-center font-semibold text-lime-500">
            {tradingPartner.name}
          </p>
          <div className="xs:flex-row-reverse flex justify-between">
            <Inventory
              items={theirInventory}
              title="Inventory"
              rowOrientation="rtl"
            />
            <Inventory
              items={theirOffer ?? { ...emptyOffer }}
              ceilings={tradingPartner.inventory}
              title="Offer"
              centralizeTitle
              omitLabels
              setInventory={(offer) => {
                setTheirOffer({ ...offer });
                setTheirInventory(
                  getUpdatedInventory(tradingPartner.inventory, offer),
                );
              }}
            />
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between pt-4">
        <Dialog.Close>
          <Button color="gray">Cancel</Button>
        </Dialog.Close>
        <Dialog.Close>
          <Button>Trade</Button>
        </Dialog.Close>
      </footer>
    </Dialog.Content>
  );
}
