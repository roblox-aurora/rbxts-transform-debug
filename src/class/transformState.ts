import assert from "assert";
import ts from "typescript";
import { CALL_MACROS } from "../transform/macros/call/callMacros";
import { CallMacro } from "../transform/macros/macro";
import { GitStatusProvider } from "./gitStatusProvider";
import { SymbolProvider } from "./symbolProvider";

export interface TransformConfiguration {
	enabled: boolean;
	verbose?: boolean;
	version: 1 | 2;
	environmentRequires?: Record<string, string | boolean>;
}

export class TransformState {
	private isMacrosSetup = false;
	public typeChecker: ts.TypeChecker;
	public options = this.program.getCompilerOptions();
	public srcDir = this.options.rootDir ?? process.cwd();

	private callMacros = new Map<ts.Symbol, CallMacro>();

	public symbolProvider: SymbolProvider;
	public readonly gitProvider: GitStatusProvider;

	public constructor(
		public program: ts.Program,
		public context: ts.TransformationContext,
		public config: TransformConfiguration,
	) {
		this.typeChecker = program.getTypeChecker();
		this.symbolProvider = new SymbolProvider(this);
		this.gitProvider = new GitStatusProvider(this);
		this.initMacros();
	}

	private initMacros() {
		if (this.isMacrosSetup) return;
		this.isMacrosSetup = true;

		for (const macro of CALL_MACROS) {
			const symbols = macro.getSymbol(this);
			if (Array.isArray(symbols)) {
				for (const symbol of symbols) {
					this.callMacros.set(symbol, macro);
				}
			} else {
				this.callMacros.set(symbols, macro);
			}
		}
	}

	public getCallMacro(symbol: ts.Symbol): CallMacro | undefined {
		return this.callMacros.get(symbol);
	}

	public getSymbol(node: ts.Node, followAlias = true): ts.Symbol | undefined {
		const symbol = this.typeChecker.getSymbolAtLocation(node);

		if (symbol && followAlias) {
			return ts.skipAlias(symbol, this.typeChecker);
		} else {
			return symbol;
		}
	}
}
