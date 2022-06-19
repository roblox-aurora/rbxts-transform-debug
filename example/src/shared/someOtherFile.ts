export interface TestInterface {
    name: string;
}

export function  test() {
    return identity<TestInterface>({name: "Testing"});
}