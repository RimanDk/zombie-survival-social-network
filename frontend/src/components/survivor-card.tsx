// libs
import { AlertDialog, Button, Dialog, Tooltip } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { FaExchangeAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

// internals
import { GenderIndicator, InfectionReportGauge, TradingPanel } from ".";
import {
  Toast,
  useSearchStore,
  useSurvivorStore,
  useToastsStore,
} from "../stores";
import { LatLon, Survivor } from "../types";

const TOASTS: Record<string, Toast> = {
  "report-success": {
    title: "Infection reported!",
    description: "Thank you! Stay safe out there!",
    type: "success",
    open: false,
  },
  "report-unauthorized": {
    title: "Unauthorized",
    description: "Your id doesn't match any we have in the system",
    type: "error",
    open: false,
  },
  "report-error": {
    title: "Failed to report",
    description: "An error occurred while adding your report to the system",
    type: "error",
    open: false,
  },
};
interface SurvivorCardProps {
  survivor: Survivor;
}
export function SurvivorCard({ survivor }: SurvivorCardProps) {
  const myId = useSurvivorStore((state) => state.id);
  const maxDistance = useSearchStore((state) => state.maxDistance);

  const { openToast, bulkRegisterToasts } = useToastsStore(
    useShallow((state) => ({
      openToast: state.actions.openToast,
      bulkRegisterToasts: state.actions.bulkRegisterToasts,
    })),
  );
  // Avoid updating ToastsEngine while this renders
  setTimeout(() => bulkRegisterToasts({ ...TOASTS }), 0);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alreadyReported = !!~(survivor.infectionReports ?? []).findIndex(
    ({ reporter_id }) => reporter_id === myId,
  );

  const queryClient = useQueryClient();

  const mutationFn = useCallback(async () => {
    const headers = new Headers();
    headers.append("X-User-Id", myId!);

    const response = await fetch(`/api/survivors/${survivor.id}/report/`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        openToast("report-unauthorized");
        throw new Error("Unauthorized");
      }
      openToast("report-error");
      throw new Error("An error occurred");
    }
    return await response.json();
  }, [myId, survivor.id, openToast]);

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      openToast("report-success");
      queryClient.invalidateQueries({
        queryKey: ["get-survivors", myId, maxDistance],
      });
    },
  });

  return (
    <section
      className={classNames(
        "group",
        "bg-linear-20 from-lime-300/50 to-slate-800 to-30% p-[1px]",
        "transition-all duration-150 ease-in-out hover:from-lime-300/70",
        {
          "cursor-pointer": myId,
        },
      )}
    >
      <div
        className={classNames(
          "relative bg-zinc-900 p-2 text-white/85",
          "transition-all duration-150 ease-in-out",
          "group-hover:bg-zinc-800 group-hover:text-white",
        )}
      >
        <div
          className="grid grid-cols-[auto_auto] items-center"
          onClick={() => {
            if (!myId) {
              return;
            }
            setIsCollapsed((prev) => !prev);
          }}
        >
          <p className="font-semibold">{survivor.name}</p>
          <div className="flex items-center justify-end gap-2 text-sm font-semibold">
            <p>{survivor.age} yo</p>
            <GenderIndicator gender={survivor.gender} />
          </div>
          <Distance
            location={survivor.lastLocation}
            size="sm"
            withDirection
            withMarker
          />
          <div className="min-w-16 justify-self-end">
            <InfectionReportGauge reports={survivor.infectionReports ?? []} />
          </div>
        </div>
        <MdOutlineKeyboardArrowDown
          className={classNames(
            "absolute -bottom-1 left-1/2 hidden -translate-x-1/2 text-lime-500",
            {
              "rotate-180 group-hover:block": myId && !isCollapsed,
              "group-hover:block": myId && isCollapsed,
            },
          )}
        />
        <footer
          className={classNames(
            "mt-2 flex items-center justify-between",
            "transform transition-all transition-discrete duration-200 [@starting-style]:opacity-0",
            {
              "hidden opacity-0": isCollapsed,
              "block opacity-100": !isCollapsed,
            },
          )}
        >
          <Dialog.Root>
            <Dialog.Trigger>
              <Button size="1">
                <FaExchangeAlt /> Trade
              </Button>
            </Dialog.Trigger>

            <TradingPanel tradingPartner={survivor} />
          </Dialog.Root>

          <AlertDialog.Root>
            <Tooltip
              content={
                alreadyReported ?
                  "You have already reported this person"
                : "If you are certain this person is infected, you should report it"
              }
              maxWidth="10rem"
            >
              <AlertDialog.Trigger>
                <Button size="1" disabled={alreadyReported}>
                  <FiAlertTriangle />
                  Report
                </Button>
              </AlertDialog.Trigger>
            </Tooltip>

            <AlertDialog.Content maxWidth="30rem">
              <AlertDialog.Title>Report {survivor.name}</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure? If {survivor.name} is infected, you should report
                them. At the same time, however, you should be certain before
                doing so. Once a person has been reported by three different
                survivors, they will be marked as infected and won't show up in
                the list anymore.
              </AlertDialog.Description>
              <footer className="flex items-center justify-between pt-4">
                <AlertDialog.Cancel className="AlertDialogAction">
                  <Button color="gray">
                    <IoChevronBackOutline /> Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action className="AlertDialogAction">
                  <Button
                    onClick={async () => {
                      await mutation.mutate();
                    }}
                  >
                    <FiAlertTriangle />
                    Report
                  </Button>
                </AlertDialog.Action>
              </footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </footer>
      </div>
    </section>
  );
}

interface DistanceProps {
  location: LatLon;
  withDirection?: boolean;
  withMarker?: boolean;
  size?: "sm" | "md" | "lg";
}
function Distance({
  location,
  size = "md",
  withDirection,
  withMarker,
}: DistanceProps) {
  const { distance } = location;

  if (distance === undefined || distance === null) {
    return <span />;
  }

  const translatedDistance =
    distance < 1000 ?
      `${distance.toFixed(2)}m`
    : `${(distance / 1000).toFixed(2)}km`;

  return (
    <p
      className={classNames("flex items-center gap-1", {
        "text-sm": size === "sm",
        "text-base": size === "md",
        "text-lg": size === "lg",
      })}
    >
      {withMarker && <FaMapMarkerAlt className="text-lime-500" />}
      {translatedDistance}
      {withDirection && <DirectionIndicator location={location} />}
    </p>
  );
}

interface DirectionIndicatorProps {
  location: LatLon;
}
function DirectionIndicator({ location }: DirectionIndicatorProps) {
  const { latitude, longitude } = location;

  const { myLongitude, myLatitude } = useSurvivorStore(
    useShallow((state) => ({
      myLatitude: state.latitude,
      myLongitude: state.longitude,
    })),
  );

  const latDirection = myLatitude! > latitude ? "S" : "N";
  const lonDirection = myLongitude! > longitude ? "W" : "E";

  return (
    <span>
      {latDirection}
      {lonDirection}
    </span>
  );
}
