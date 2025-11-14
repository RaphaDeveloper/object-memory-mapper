import { EntitiesByType } from "../entities/entities-by-type";

export interface Operation {
    applyOn(entities: EntitiesByType): void;
}