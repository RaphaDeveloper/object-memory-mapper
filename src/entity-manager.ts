import { Entity, EntityType } from "./entities/entity";
import { OperationSet } from "./operations/operation-set";
import { PersistenceTarget } from "./persistence-target.interface";

export class EntityManager {
    private operationSet: OperationSet = new OperationSet();

    constructor(private readonly persistenceTarget: PersistenceTarget) {}

    save<T extends Entity>(entity: T) {
        this.operationSet.save(entity);
    }

    delete<T extends Entity>(entity: T) {
        if (this.allEntities.get(entity.constructor).has(entity.id)) {
            this.operationSet.delete(entity);
        }
    }

    findOne<T>(entityType: EntityType<T>, where: any) {
        return this.allEntities.get(entityType).get(where.id) as T ?? null;
    }

    flush() {
        this.persistenceTarget.persist(this.operationSet);

        this.operationSet.clear();
    }

    get allEntities() {
        return this.operationSet.applyOn(this.persistenceTarget.allEntities);
    }
}