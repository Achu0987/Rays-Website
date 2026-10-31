"use client";

import { useCallback, useState } from "react";
import Intro from "./Intro";
import World from "./World";
import { useDevice } from "@/lib/device";

/**
 * The whole homepage: the loading dial first, then the world. The world mounts the moment
 * the visitor clicks so it can load while the light rises; the intro then fades away.
 */
export default function Experience() {
  const { mode, mobile } = useDevice();
  // intro → entering (world loads behind the welcome) → crossing (intro fades) → world
  const [stage, setStage] = useState("intro");

  const onEnter = useCallback(() => setStage("entering"), []);

  const onEntered = useCallback(() => {
    setStage("crossing");
    window.setTimeout(() => setStage("world"), 1100);
  }, []);

  return (
    <div className={`experience stage-${stage}`}>
      {stage !== "intro" && <World mode={mode} mobile={mobile} />}
      {stage !== "world" && <Intro mode={mode} mobile={mobile} onEnter={onEnter} onEntered={onEntered} />}
    </div>
  );
}
