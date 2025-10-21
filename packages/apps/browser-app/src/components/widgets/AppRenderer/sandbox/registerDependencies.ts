import React from "react";

export const dependenciesGlobalVar = "__dependencies__";

export default function registerDependencies() {
  (window as any)[dependenciesGlobalVar] = {
    React: React,
  };
}
