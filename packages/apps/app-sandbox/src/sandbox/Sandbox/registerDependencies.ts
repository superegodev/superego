import React from "react";
import Echart from "../../sandbox-components/Echart/Echart.js";

export const dependenciesGlobalVar = "__dependencies__";

export default function registerDependencies() {
  if (!(window as any)[dependenciesGlobalVar]) {
    (window as any)[dependenciesGlobalVar] = {
      react: React,
      "@superego/app-sandbox/components": {
        Echart,
      },
    };
  }
}
