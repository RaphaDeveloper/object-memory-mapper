import { EntitiesByType } from "./entities/entities-by-type";
import { EntityManager } from "./entity-manager";
import { OperationSet } from "./operations/operation-set";
import { PersistenceTarget } from "./persistence-target.interface";
import { Transaction } from "./transaction";

export class DataSource implements PersistenceTarget {
    allEntities: EntitiesByType = new EntitiesByType();

    createEntityManager(): EntityManager {
        return new EntityManager(this);
    }

    async beginTransaction<T>(callback: (entityManager: EntityManager) => Promise<T>): Promise<T> {
        const transaction = new Transaction(this);
        const entityManager = new EntityManager(transaction);

        const result = await callback(entityManager);

        transaction.commit();

        return result;
    }

    persist(operationSet: OperationSet) {
        this.allEntities = operationSet.applyOn(this.allEntities);
    }
}