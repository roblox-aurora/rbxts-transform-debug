import path from "path";
import ts from "typescript";
import { TransformState } from "./transformState";
import fs from "fs";
import { isPathDescendantOf } from "../util/isPathDescendantOf";
import assert from "assert";

export const moduleResolutionCache = new Map<string, string | false>();

class FileSymbol {
	private fileSymbol: ts.Symbol;

	public constructor(public state: TransformState, public file: ts.SourceFile) {
		const fileSymbol = this.state.getSymbol(file);
		assert(fileSymbol, "Invalid file symbol");
		this.fileSymbol = fileSymbol;

		this.register();
	}

	get(name: string) {
		const exportSymbol = this.fileSymbol.exports?.get(name as ts.__String);
		assert(exportSymbol);

		return exportSymbol;
	}

	private register() {
		// for (const statement of this.file.statements) {
		// 	if (ts.isFunctionDeclaration(statement)) {
		// 		this.registerFunction(statement);
		// 	}
		// }
	}
}

export const RBXTS_SYMBOL_NAMES = {
	LuaTuple: "LuaTuple",
} as const;

const NOMINAL_LUA_TUPLE_NAME = "_nominal_LuaTuple";

export class SymbolProvider {
	public moduleFile: FileSymbol | undefined;
	public symbols = new Map<string, ts.Symbol>();

	public constructor(private state: TransformState) {
		this.lookupModule();

		for (const symbolName of Object.values(RBXTS_SYMBOL_NAMES)) {
			const symbol = state.typeChecker.resolveName(symbolName, undefined, ts.SymbolFlags.All, false);
			if (symbol) {
				this.symbols.set(symbolName, symbol);
			} else {
				throw `MacroManager could not find symbol for ${symbolName}`;
			}
		}

		const luaTupleTypeDec = this.symbols
			.get(RBXTS_SYMBOL_NAMES.LuaTuple)
			?.declarations?.find((v) => ts.isTypeAliasDeclaration(v));
		if (luaTupleTypeDec) {
			const nominalLuaTupleSymbol = state.typeChecker
				.getTypeAtLocation(luaTupleTypeDec)
				.getProperty(NOMINAL_LUA_TUPLE_NAME);
			if (nominalLuaTupleSymbol) {
				this.symbols.set(NOMINAL_LUA_TUPLE_NAME, nominalLuaTupleSymbol);
			}
		}
	}

	public isLuaTupleType(type: ts.Type): boolean {
		return type.getProperty(NOMINAL_LUA_TUPLE_NAME) === this.symbols.get(NOMINAL_LUA_TUPLE_NAME);
	}

	public getGlobalSymbolByNameOrThrow(typeChecker: ts.TypeChecker, name: string, meaning: ts.SymbolFlags): ts.Symbol {
		const symbol = typeChecker.resolveName(name, undefined, meaning, false);
		if (symbol) {
			return symbol;
		}
		throw `nooop`;
	}

	public isModule(file: ts.SourceFile): boolean {
		if (
			isPathDescendantOf(file.fileName, this.debugDir) &&
			!isPathDescendantOf(file.fileName, path.join(this.debugDir, "example"))
		) {
			return true;
		} else {
			return false;
		}
	}

	private lookupModule() {
		for (const file of this.state.program.getSourceFiles()) {
			if (this.isModule(file)) {
				this.moduleFile = new FileSymbol(this.state, file);
			}
		}
	}

	private resolveModuleDir(moduleName: string) {
		const modulePath = moduleResolutionCache.get(moduleName);
		if (modulePath !== undefined) return modulePath || undefined;

		const dummyFile = path.join(this.state.srcDir, "dummy.ts");
		const module = ts.resolveModuleName(moduleName, dummyFile, this.state.options, ts.sys);
		const resolvedModule = module.resolvedModule;
		if (resolvedModule) {
			const modulePath = fs.realpathSync(path.join(resolvedModule.resolvedFileName, "../"));
			moduleResolutionCache.set(moduleName, modulePath);
			return modulePath;
		}
		moduleResolutionCache.set(moduleName, false);
	}

	private typesDir = this.resolveModuleDir("@rbxts/types")!;
	private debugDir = this.resolveModuleDir("rbxts-transform-debug")!;
}
