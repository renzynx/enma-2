process.env.NODE_ENV ??= "development";

import "reflect-metadata";
import { join } from "path";
import { config } from "dotenv-cra";
import { srcDir } from "./constants";
config({ path: join(srcDir, ".env") });
