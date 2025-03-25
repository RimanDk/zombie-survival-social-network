// libs
import { AlertDialog, Button, Dialog, Tooltip } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { useState } from "react";
import { FaExchangeAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useShallow } from "zustand/react/shallow";

// internals
import { GenderIndicator, InfectionReportGauge, TradingPanel } from ".";
import { QueryKeys } from "../constants";
import { useReportInfection } from "../hooks";
import { useSearchStore, useSurvivorStore, useToastsStore } from "../stores";
import { LatLon, Survivor } from "../types";

interface SurvivorCardProps {
  survivor: Survivor;
}
export function SurvivorCard({ survivor }: SurvivorCardProps) {
  const myId = useSurvivorStore((state) => state.id);
  const maxDistance = useSearchStore((state) => state.maxDistance);
  const openToast = useToastsStore((state) => state.actions.openToast);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alreadyReported = !!~(survivor.infectionReports ?? []).findIndex(
    ({ reporter_id }) => reporter_id === myId,
  );

  const queryClient = useQueryClient();

  const { mutate } = useReportInfection({
    identifier: myId,
    survivor: survivor.id,
    onSuccess: () => {
      openToast("report-success");
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GetSurvivors, myId, maxDistance],
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
                  <Button onClick={() => mutate()}>
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
