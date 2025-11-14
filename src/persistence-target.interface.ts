import { EntitiesByType } from "./entities/entities-by-type";
import { OperationSet } from "./operations/operation-set";

export interface PersistenceTarget {
    allEntities: EntitiesByType;
    persist(operationSet: OperationSet): void;
}