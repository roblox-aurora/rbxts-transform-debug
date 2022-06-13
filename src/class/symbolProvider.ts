import path from "path";
import ts from "typescript";
import { TransformState } from "./transformState";
import fs from "fs";
import { isPathDescendantOf } from "../util/isPathDescendantOf";
import assert from "assert";

export const moduleResolutionCache = new Map<string, string | false>();

class FunctionSymbol {
	public constructor(
		public fileSymbol: ts.Symbol,
		public state: TransformState,
		private node: ts.FunctionDeclaration,
	) {}

	public getSymbol() {
		return this.state.getSymbol(this.node);
	}
}

class FileSymbol {
	private fileSymbol: ts.Symbol;
	private functions = new Map<string, FunctionSymbol>();

	public constructor(public state: TransformState, public file: ts.SourceFile) {
		const fileSymbol = this.state.getSymbol(file);
		assert(fileSymbol, "Invalid file symbol");
		this.fileSymbol = fileSymbol;

		this.register();
	}

	getFunction(name: string) {
		return this.functions.get(name);
	}

	get(name: string) {
		const exportSymbol = this.fileSymbol.exports?.get(name as ts.__String);
		assert(exportSymbol);

		return exportSymbol;
	}

	private registerFunction(node: ts.FunctionDeclaration) {
		const nodeId = node.name?.text;
		if (nodeId === undefined) return;

		let func = this.functions.get(nodeId);
		if (func === undefined) {
			func = new FunctionSymbol(this.fileSymbol, this.state, node);
			this.functions.set(nodeId, func);
		}

		return func;
	}

	private register() {
		for (const statement of this.file.statements) {
			if (ts.isFunctionDeclaration(statement)) {
				this.registerFunction(statement);
			}
		}
	}
}

export class SymbolProvider {
	public moduleFile: FileSymbol | undefined;

	public constructor(private state: TransformState) {
		this.lookupModule();
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

	private debugDir = this.resolveModuleDir("rbxts-transform-debug")!;
}
