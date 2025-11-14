export type EntityType<T> = Function & {
    prototype: T;
};

export type Entity = {
    id: any,
}