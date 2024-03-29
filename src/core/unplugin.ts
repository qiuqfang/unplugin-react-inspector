import type { UserOptions } from "./../types";
import { createUnplugin } from "unplugin";
import { compile } from "./compiler";
import { createServer } from "./server";
import { DEFAULT_OPTIONS } from "./constants";
import { getPort } from "@qiuqfang/get-port";
import { normalizePath } from "../utils";

export default createUnplugin<UserOptions>((ops = DEFAULT_OPTIONS) => {
  let defaultPort: number;

  const options = { ...DEFAULT_OPTIONS, ...ops };

  if (options.enabled) {
    // get port
    getPort().then((port) => {
      console.log("port", port);

      defaultPort = port;
      // initialize server
      createServer(port);
    });
  }

  return {
    name: "unplugin-react-inspector",
    enforce: "pre",
    transformInclude(id) {
      return id.endsWith(".jsx") || id.endsWith(".tsx");
    },
    transform(code, id) {
      if (!id) return;

      // normalize path
      const filePath = normalizePath(id);

      // filter
      const isInspectorOverlay = filterInspectorOverlay(filePath);

      if (!isInspectorOverlay && options.enabled)
        return compile(code, filePath, {
          port: defaultPort,
          enabled: options.enabled,
          injectClientEntryFile: options.injectClientEntryFile,
        });
      return code;
    },
  };
});

export const filterInspectorOverlay = (filePath: string) =>
  !!filePath.match("unplugin-react-inspector/src/client") || !!filePath.match(".routes");
