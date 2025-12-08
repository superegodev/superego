import React from "react";
import Alert from "../components/Alert/Alert.js";
import Button from "../components/Button/Button.js";
import ButtonLink from "../components/ButtonLink/ButtonLink.js";
import DefaultApp from "../components/DefaultApp/DefaultApp.js";
import Echart from "../components/Echart/Echart.js";
import PlainDatePicker from "../components/forms/PlainDatePicker.js";
import Select from "../components/forms/Select.js";
import Grid from "../components/Grid/Grid.js";
import IconButton from "../components/IconButton/IconButton.js";
import Image from "../components/Image/Image.js";
import Link from "../components/Link/Link.js";
import SimpleMonthCalendar from "../components/SimpleMonthCalendar/SimpleMonthCalendar.js";
import Table from "../components/Table/Table.js";
import Text from "../components/Text/Text.js";
import Tile from "../components/Tile/Tile.js";
import useCreateDocument from "../hooks/useCreateDocument.js";
import useCreateNewDocumentVersion from "../hooks/useCreateNewDocumentVersion.js";
import theme from "../theme/theme.js";
import dependenciesGlobalVar from "./dependenciesGlobalVar.js";

export default function registerDependencies() {
  if (!(window as any)[dependenciesGlobalVar]) {
    (window as any)[dependenciesGlobalVar] = {
      react: React,
      "@superego/app-sandbox/components": {
        Alert,
        Button,
        ButtonLink,
        SimpleMonthCalendar,
        DefaultApp,
        Echart,
        Grid,
        IconButton,
        Image,
        Link,
        PlainDatePicker,
        Select,
        Table,
        Text,
        Tile,
      },
      "@superego/app-sandbox/hooks": {
        useCreateDocument,
        useCreateNewDocumentVersion,
      },
      "@superego/app-sandbox/theme": theme,
    };
  }
}
