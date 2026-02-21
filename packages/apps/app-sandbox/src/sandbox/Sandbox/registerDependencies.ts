import React from "react";
import Alert from "../components/Alert/Alert.js";
import Button from "../components/Button/Button.js";
import ButtonLink from "../components/ButtonLink/ButtonLink.js";
import DefaultApp from "../components/DefaultApp/DefaultApp.js";
import Echart from "../components/Echart/Echart.js";
import NumberField from "../components/forms/NumberField.js";
import PlainDatePicker from "../components/forms/PlainDatePicker.js";
import PlainDateRangePicker from "../components/forms/PlainDateRangePicker.js";
import RadioGroup from "../components/forms/RadioGroup.js";
import Select from "../components/forms/Select.js";
import TextField from "../components/forms/TextField.js";
import GeoJSONMap from "../components/GeoJSONMap/GeoJSONMap.js";
import Grid from "../components/Grid/Grid.js";
import IconButton from "../components/IconButton/IconButton.js";
import Image from "../components/Image/Image.js";
import KanbanBoard from "../components/KanbanBoard/KanbanBoard.js";
import Link from "../components/Link/Link.js";
import SimpleMonthCalendar from "../components/SimpleMonthCalendar/SimpleMonthCalendar.js";
import Table from "../components/Table/Table.js";
import Text from "../components/Text/Text.js";
import Tile from "../components/Tile/Tile.js";
import ToggleButton from "../components/ToggleButton/ToggleButton.js";
import useCreateDocument from "../hooks/useCreateDocument.js";
import useCreateNewDocumentVersion from "../hooks/useCreateNewDocumentVersion.js";
import useDeleteDocument from "../hooks/useDeleteDocument.js";
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
        GeoJSONMap,
        Grid,
        IconButton,
        Image,
        KanbanBoard,
        Link,
        NumberField,
        PlainDatePicker,
        PlainDateRangePicker,
        RadioGroup,
        Select,
        Table,
        Text,
        TextField,
        Tile,
        ToggleButton,
      },
      "@superego/app-sandbox/hooks": {
        useCreateDocument,
        useCreateNewDocumentVersion,
        useDeleteDocument,
      },
      "@superego/app-sandbox/theme": theme,
    };
  }
}
