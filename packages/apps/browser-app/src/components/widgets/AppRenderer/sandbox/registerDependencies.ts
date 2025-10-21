import React from "react";
import Echart from "../../../design-system/Echart/Echart.js";

export const dependenciesGlobalVar = "__dependencies__";

export default function registerDependencies() {
  (window as any)[dependenciesGlobalVar] = {
    react: React,
    "@superego/components": {
      Echart,
    },
  };
}
