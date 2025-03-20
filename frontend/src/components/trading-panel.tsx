// libs
import { Button, Dialog } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

// internals
import { Inventory } from ".";
import { useItems } from "../hooks";
import {
  Toast,
  useSearchStore,
  useSurvivorStore,
  useToastsStore,
} from "../stores";
import { Survivor, Inventory as TInventory } from "../types";

const TOASTS: Record<string, Toast> = {
  "trade-error": {
    title: "Trade failed",
    description: "An error occurred while trading items",
    type: "error",
    open: false,
  },
  "trade-success": {
    title: "Trade successful",
    description: "Items have been traded successfully",
    type: "success",
    open: false,
  },
};

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

  const maxDistance = useSearchStore((state) => state.maxDistance);

  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

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
      update[key] = (inventory[key] ?? 0) - (offer[key] ?? 0);
    }
    return update;
  };

  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    async (data: {
      survivor_a_items: { survivor_id: string; items: TInventory };
      survivor_b_items: { survivor_id: string; items: TInventory };
    }) => {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("X-User-Id", myId!);

      const response = await fetch("/api/survivors/trade/", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        openToast("trade-error");
        throw new Error("Failed to trade");
      }
      try {
        return await response.json();
      } catch (err) {
        openToast("trade-error");
        throw err;
      }
    },
    [myId, openToast],
  );

  const mutation = useMutation({
    mutationFn,
    onSuccess: async () => {
      openToast("trade-success");

      setMyTempInventory({
        ...myInventory,
      });
      setMyOffer(undefined);
      setTheirInventory({
        ...tradingPartner.inventory,
      });
      setTheirOffer(undefined);

      Promise.all([
        // Refresh my profile
        queryClient.invalidateQueries({
          queryKey: ["get-survivor", myId],
        }),
        // Refresh full list
        queryClient.invalidateQueries({
          queryKey: ["get-survivors", myId, maxDistance],
        }),
      ]);
    },
  });

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
              title="Trade"
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
              title="For"
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
          <Button
            disabled={!tradingPartner.id || !myOffer || !theirOffer}
            onClick={async () => {
              await mutation.mutate({
                survivor_a_items: { survivor_id: myId!, items: myOffer! },
                survivor_b_items: {
                  survivor_id: tradingPartner.id!,
                  items: theirOffer!,
                }!,
              });
            }}
          >
            Trade
          </Button>
        </Dialog.Close>
      </footer>
    </Dialog.Content>
  );
}
