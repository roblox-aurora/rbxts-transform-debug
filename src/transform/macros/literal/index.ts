import { PropertyMacro } from "../macro";
import { FilePropertyMacro } from "./fileMacro";
import { PackagePropertyMacro } from "./package";

export const PROPERTY_MACROS = new Array<PropertyMacro>(PackagePropertyMacro, FilePropertyMacro);
