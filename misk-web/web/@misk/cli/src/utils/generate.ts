import * as fs from "fs-extra"
import { Files, JsonOptions } from "../utils"
import {
  createPackage,
  createTsconfig,
  generatedByCLI,
  gitignore,
  tslint,
  webpack
} from "./templates"

export const generateBuildFiles = async () => {
  const pkg = await fs.readJson(Files.package)
  const miskTab = await fs.readJson(Files.miskTab)
  // Write out fresh files
  fs.writeFile(Files.gitignore, gitignore)
  fs.writeJson(Files.package, createPackage(miskTab.slug, pkg), JsonOptions)
  fs.writeJson(
    Files.tsconfig,
    createTsconfig(
      miskTab.outDir ? miskTab.outDir : `lib/web/_tab/${miskTab.slug}`
    ),
    JsonOptions
  )
  fs.writeJson(Files.tslint, tslint, JsonOptions)
  fs.writeFile(Files.webpack, webpack)

  // Append non-package JSON files with generated by comment
  fs.writeFile(Files.tsconfig, generatedByCLI, { flag: "a" })
  fs.writeFile(Files.tslint, generatedByCLI, { flag: "a" })
}