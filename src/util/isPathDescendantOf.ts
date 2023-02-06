import path from "path";

/**
 * Checks if the `filePath` path is a descendant of the `dirPath` path.
 * @param filePath A path to a file.
 * @param dirPath A path to a directory.
 */
export function isPathDescendantOf(filePath: string, dirPath: string): boolean {
	return dirPath === filePath || !path.relative(dirPath, filePath).startsWith("..");
}
