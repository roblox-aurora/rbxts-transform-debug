export function getObjectRelativePath(object: Record<string, unknown>, path: string) {
	return object[path];
}
