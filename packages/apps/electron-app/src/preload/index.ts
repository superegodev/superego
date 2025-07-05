import { contextBridge } from "electron";
import BackendIPCProxyClient from "../ipc-proxy/BackendIPCProxyClient.js";

contextBridge.exposeInMainWorld("backend", new BackendIPCProxyClient());
