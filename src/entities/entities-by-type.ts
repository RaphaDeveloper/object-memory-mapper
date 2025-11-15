import { ImmutableMap } from "../helpers/ImmutableMap";
import type { Entity, EntityType } from "./entity";

export class EntitiesByType {
    private entitiesByType: Map<EntityType<Entity>, ImmutableMap<any, Entity>>
        = new Map<EntityType<Entity>, ImmutableMap<any, Entity>>();

    constructor(initialEntitiesByType: EntitiesByType | undefined = undefined) {
        if (initialEntitiesByType) {
            this.entitiesByType = new Map<EntityType<Entity>, ImmutableMap<any, Entity>>();

            for (const [entityType] of initialEntitiesByType) {
                this.entitiesByType.set(entityType, new ImmutableMap<any, Entity>());

                for (const [id, entity] of initialEntitiesByType.get(entityType)) {
                    this.entitiesByType.get(entityType)!.set(id, entity);
                }
            }
        }
    }

    get(entityType: EntityType<Entity>) {
        if (!this.entitiesByType.has(entityType)) {
            this.entitiesByType.set(entityType, new ImmutableMap<any, Entity>());
        }

        return this.entitiesByType.get(entityType)!;
    }

    clear() {
        this.entitiesByType.clear();
    }

    [Symbol.iterator](): IterableIterator<[EntityType<Entity>, ImmutableMap<any, Entity>]> {
        return this.entitiesByType[Symbol.iterator]();
    }
}