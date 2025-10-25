import React from "react";
import Alert from "../components/Alert/Alert.js";
import Button from "../components/Button/Button.js";
import DefaultApp from "../components/DefaultApp/DefaultApp.js";
import Echart from "../components/Echart/Echart.js";
import Grid from "../components/Grid/Grid.js";
import Text from "../components/Text/Text.js";
import Tile from "../components/Tile/Tile.js";
import dependenciesGlobalVar from "./dependenciesGlobalVar.js";

export default function registerDependencies() {
  if (!(window as any)[dependenciesGlobalVar]) {
    (window as any)[dependenciesGlobalVar] = {
      react: React,
      "@superego/app-sandbox/components": {
        Alert,
        Button,
        DefaultApp,
        Echart,
        Grid,
        Text,
        Tile,
      },
    };
  }
}
