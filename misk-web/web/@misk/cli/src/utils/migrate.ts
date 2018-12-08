/**
 * Utilities to migrate from old manually managed build files to `miskTab.json` + @misk/cli driven builds
 */

import * as fs from "fs-extra"
import { Files, JsonOptions } from "../utils"

export const migrate = async () => {
  let pkgMiskTab
  if (await fs.existsSync(Files.package)) {
    const pkg = await fs.readJson(Files.package)
    if (pkg.name.startsWith("@misk/")) {
      throw Error(
        "misk-web CLI should not be used on @misk/ packages which have custom build tools."
      )
    }
    pkgMiskTab = pkg.miskTab ? pkg.miskTab : null
  } else {
    pkgMiskTab = null
  }

  if (pkgMiskTab && (await fs.existsSync(Files.miskTab))) {
    // miskTab.json and package with miskTab exists
    throw Error(
      "[MIGRATE] Remove existing miskTab.json OR remove miskTab block from existing package.json."
    )
  } else if (!pkgMiskTab && (await fs.existsSync(Files.miskTab))) {
    console.log("[MIGRATE] miskTab.json exists. No migration required.")
  } else if (pkgMiskTab && !(await fs.existsSync(Files.miskTab))) {
    // TODO Add type enforcement that it is valid IMiskTabJSON
    fs.writeJson(Files.miskTab, pkgMiskTab, JsonOptions)
    // move all build files to an .old-build-files folder
    console.log(`[MIGRATE] Stashing old build files in ./${Files.old}`)
    await fs.mkdirp(Files.old)
    fs.copy(Files.package, `${Files.old}/${Files.package}`)
    if (await fs.existsSync(Files.gitignore)) {
      fs.move(Files.gitignore, `${Files.old}/${Files.gitignore}`)
    }
    if (await fs.existsSync(Files.prettier)) {
      fs.move(Files.prettier, `${Files.old}/${Files.prettier}`)
    }
    if (await fs.existsSync(Files.tsconfig)) {
      fs.move(Files.tsconfig, `${Files.old}/${Files.tsconfig}`)
    }
    if (await fs.existsSync(Files.tslint)) {
      fs.move(Files.tslint, `${Files.old}/${Files.tslint}`)
    }
    if (await fs.existsSync(Files.webpack)) {
      fs.move(Files.webpack, `${Files.old}/${Files.webpack}`)
    }
    if (await fs.existsSync(Files.packageLock)) {
      fs.remove(Files.packageLock)
    }
    if (await fs.existsSync(Files.yarnLock)) {
      fs.remove(Files.yarnLock)
    }
  } else if (!pkgMiskTab && !(await fs.existsSync(Files.miskTab))) {
    throw Error("[MIGRATE] No miskTab block found in existing package.json.")
  }
}