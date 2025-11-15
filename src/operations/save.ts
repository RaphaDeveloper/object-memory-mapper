import { EntitiesByType } from "../entities/entities-by-type";
import type { Entity } from "../entities/entity";
import type { Operation } from "./operation.interface";

export class Save implements Operation {
    constructor(private entity: Entity) {}

    applyOn(entities: EntitiesByType): void {
        const entityType = this.entity.constructor;

        entities.get(entityType).set(this.entity.id, this.entity);
    }
}