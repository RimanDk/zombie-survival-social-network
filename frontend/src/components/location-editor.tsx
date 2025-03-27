// libs
import { Button, TextField } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { ChangeEvent, useState } from "react";
import { FaMap } from "react-icons/fa";
import { useShallow } from "zustand/react/shallow";

// internals
import { QueryKeys } from "../constants";
import { debounce } from "../helpers";
import { useUpdateSurvivorLocation } from "../hooks";
import { useSearchStore, useSurvivorStore, useToastsStore } from "../stores";

interface LocationEditorProps {
  latitude?: string;
  longitude?: string;
  setLatitude?: (latitude: string) => void;
  setLongitude?: (longitude: string) => void;
}
export function LocationEditor({
  latitude: extLatitude,
  longitude: extLongitude,
  setLatitude: extSetLatitude,
  setLongitude: extSetLongitude,
}: LocationEditorProps) {
  const { myId, myName, myLatitude, myLongitude, identify } = useSurvivorStore(
    useShallow((state) => ({
      myId: state.id,
      myName: state.name,
      myLatitude: state.latitude,
      myLongitude: state.longitude,
      identify: state.actions.identify,
    })),
  );
  const maxDistance = useSearchStore((state) => state.maxDistance);
  const openToast = useToastsStore((state) => state.actions.openToast);

  const [tempLatitude, setTempLatitude] = useState<string>(
    myLatitude ? `${myLatitude}` : "",
  );
  const [tempLongitude, setTempLongitude] = useState<string>(
    myLongitude ? `${myLongitude}` : "",
  );
  const [latValidity, setLatValidity] = useState<boolean | string>(true);
  const [lonValidity, setLonValidity] = useState<boolean | string>(true);

  const validateCoordinates = (coords: string, dir: "lat" | "lon") => {
    const adjusted = coords.trim().replace(",", ".").replace("-", "");

    if (!/^\d+(\.\d+)?$/g.test(adjusted)) {
      return "extraneous-characters";
    }

    if (isNaN(parseFloat(adjusted))) {
      return "nan";
    }

    const [degrees, decimalDegrees] = adjusted.split(".");

    if (
      dir === "lat" &&
      (parseInt(degrees, 10) < -90 || parseInt(degrees, 10) > 90)
    ) {
      return "invalid-lat-degrees";
    } else if (
      dir === "lon" &&
      (parseInt(degrees, 10) < -180 || parseInt(degrees, 10) > 180)
    ) {
      return "invalid-lon-degrees";
    }

    if (!decimalDegrees || decimalDegrees.length < 6) {
      return "missing-decimal-degrees";
    }

    return true;
  };

  const debouncedValidate = debounce(
    (val: string, dir: "lat" | "lon") =>
      ((fn) => fn(validateCoordinates(val, dir)))(
        dir === "lat" ? setLatValidity : setLonValidity,
      ),
    350,
  );

  const queryClient = useQueryClient();

  const { mutate } = useUpdateSurvivorLocation({
    identifier: myId,
    onSuccess: () => {
      identify(
        myId,
        myName,
        parseFloat(tempLatitude),
        parseFloat(tempLongitude),
      );
      openToast({
        id: "location-update-success",
        title: "Location updated",
        description: "Your location has been updated successfully",
        type: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GetSurvivors, myId, maxDistance],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GetSurvivor, myId],
      });
    },
    onError: (err) => {
      if (err.message === "Unauthorized") {
        openToast({
          id: "location-update-unauthorized",
          title: "Location update failed",
          description:
            "You are not authorized to update another survivor's location",
          type: "error",
        });
        return;
      }
      openToast({
        id: "location-update-error",
        title: "Location update failed",
        description: "An error occurred while updating your location",
        type: "error",
      });
    },
  });

  return (
    <fieldset>
      <p className="text-lime-500">Location</p>
      <label>
        <span className="text-sm">Latitude</span>
        <TextField.Root
          type="text"
          value={extLatitude ?? tempLatitude}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            (extSetLatitude ?? setTempLatitude)(e.target.value);
            debouncedValidate(e.target.value, "lat");
          }}
        />
      </label>
      <div
        className={classNames("my-2 rounded px-3 text-sm", {
          hidden: latValidity === true,
          flex: latValidity !== true,
        })}
        style={{ backgroundColor: "var(--accent-5)" }}
      >
        {latValidity === "extraneous-characters" && (
          <p>Latitude should contain only numbers and a single dot</p>
        )}
        {latValidity === "nan" && <p>Latitude should be a number</p>}
        {latValidity === "invalid-lat-degrees" && (
          <p>Latitude should be between -180 and 180 degrees</p>
        )}
        {latValidity === "missing-decimal-degrees" && (
          <p>Latitude should contain at least 6 decimal degrees</p>
        )}
      </div>

      <label>
        <span className="text-sm">Longitude</span>
        <TextField.Root
          type="text"
          value={extLongitude ?? tempLongitude}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            (extSetLongitude ?? setTempLongitude)(e.target.value);
            debouncedValidate(e.target.value, "lon");
          }}
        />
      </label>
      <div
        className={classNames("my-2 rounded px-3 text-sm", {
          hidden: lonValidity === true,
          flex: lonValidity !== true,
        })}
        style={{ backgroundColor: "var(--accent-5)" }}
      >
        {lonValidity === "extraneous-characters" && (
          <p>Latitude should contain only numbers and a single dot</p>
        )}
        {lonValidity === "nan" && <p>Latitude should be a number</p>}
        {lonValidity === "invalid-lat-degrees" && (
          <p>Latitude should be between -90 and 90 degrees</p>
        )}
        {lonValidity === "missing-decimal-degrees" && (
          <p>Latitude should contain at least 6 decimal degrees</p>
        )}
      </div>

      {!extSetLatitude && !extLongitude && (
        <div className="flex justify-end pt-2">
          <Button
            disabled={
              parseFloat(tempLatitude) === myLatitude &&
              parseFloat(tempLongitude) === myLongitude
            }
            onClick={() =>
              mutate({
                latitude: parseFloat(tempLatitude),
                longitude: parseFloat(tempLongitude),
              })
            }
          >
            <FaMap />
            Update location
          </Button>
        </div>
      )}
    </fieldset>
  );
}
