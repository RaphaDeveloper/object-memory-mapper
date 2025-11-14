import { DataSource } from "./datasource";
import { OperationSet } from "./operations/operation-set";
import { PersistenceTarget } from "./persistence-target.interface";

export class Transaction implements PersistenceTarget {
    operationSet: OperationSet = new OperationSet();

    constructor(private readonly ds: DataSource) {}    

    persist(operationSet: OperationSet) {
        this.operationSet = this.operationSet.concat(operationSet);
    }

    commit() {
        this.ds.persist(this.operationSet);
    }

    get allEntities() {
        return this.operationSet.applyOn(this.ds.allEntities);
    }
}