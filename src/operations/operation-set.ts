import { EntitiesByType } from "../entities/entities-by-type";
import type { Entity } from "../entities/entity";
import { Delete } from "./delete";
import type { Operation } from "./operation.interface";
import { Save } from "./save";

export class OperationSet {
    private operations: Operation[] = [];

    save(entity: Entity) {
        this.operations.push(new Save(entity));
    }

    delete(entity: Entity) {
        this.operations.push(new Delete(entity));
    }

    applyOn(entities: EntitiesByType) {
        const changedEntities = new EntitiesByType(entities);

        this.operations.forEach(c => c.applyOn(changedEntities));

        return changedEntities;
    }

    clear() {
        this.operations = [];
    }

    concat(operationSet: OperationSet) {
        const newOperationSet = new OperationSet();

        newOperationSet.operations = [...this.operations, ...operationSet.operations];

        return newOperationSet;
    }
}