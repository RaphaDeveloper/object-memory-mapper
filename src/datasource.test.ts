import { DataSource } from "./datasource";
import { EntityManager } from "./entity-manager";


class TestEntityOne {
    items: any[] = [];

    constructor(public id: number) {}
}

class TestEntityTwo {
    constructor(public id: number) {}
}

describe("DataSource", () => {
    it("creates an entity manager", () => {
        const ds = new DataSource();
    
        const em = ds.createEntityManager();
    
        expect(em).toBeTruthy();
    });

    describe("EntityManager", () => {
        it("saves the entity in it", async () => {
            const ds = new DataSource();

            const em = ds.createEntityManager();

            const firstEntity = new TestEntityOne(1);
            const secondEntity = new TestEntityOne(2);

            em.save(firstEntity);
            em.save(secondEntity);

            const savedSecondEntity = em.findOne(TestEntityOne, { id: secondEntity.id });
            const savedFirstEntity = em.findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedFirstEntity).toBeTruthy();
            expect(savedFirstEntity).toEqual(firstEntity);
            expect(savedFirstEntity).not.toBe(firstEntity);
            
            expect(savedSecondEntity).toBeTruthy();
            expect(savedSecondEntity).toEqual(secondEntity);
            expect(savedSecondEntity).not.toBe(secondEntity);
        });
        
        it("reads entity from another entity manager only after flush when the entity manager used to read is created after the flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();

            const firstEntity = new TestEntityOne(1);

            firstEntityManager.save(firstEntity);

            let savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            let savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();

            const secondEntity = new TestEntityOne(2);

            firstEntityManager.save(secondEntity);

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: secondEntity.id });
            savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: secondEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();
        });

        it("reads entity from another entity manager only after flush when the entity manager used to read is created before the flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const firstEntity = new TestEntityOne(1);

            firstEntityManager.save(firstEntity);

            let savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            let savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: firstEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();

            const secondEntity = new TestEntityOne(2);

            firstEntityManager.save(secondEntity);

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: secondEntity.id });
            savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: secondEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: secondEntity.id });
            savedEntityFromSecondEntityManager = ds.createEntityManager().findOne(TestEntityOne, { id: secondEntity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();
        });

        it("saves a copy of the entity thus keeping the saved entity immutable", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            entityManager.save(entity);

            const savedEntity = entityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntity).toEqual(entity);
            expect(savedEntity).not.toBe(entity);
        });

        it("cleans up the saved entity after from entity manager after flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            firstEntityManager.save(entity);
            firstEntityManager.flush();

            let savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id })!;
            let savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id })!;

            expect(savedEntityFromFirstEntityManager.items).toHaveLength(0);
            expect(savedEntityFromSecondEntityManager.items).toHaveLength(0);

            entity.items.push({ id: 123 });

            secondEntityManager.save(entity);            

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id })!;
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id })!;

            expect(savedEntityFromFirstEntityManager.items).toHaveLength(0);
            expect(savedEntityFromSecondEntityManager.items).toHaveLength(1);

            secondEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id })!;
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id })!;

            expect(savedEntityFromFirstEntityManager.items).toHaveLength(1);
            expect(savedEntityFromSecondEntityManager.items).toHaveLength(1);

            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id })!;
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id })!;

            expect(savedEntityFromFirstEntityManager.items).toHaveLength(1);
            expect(savedEntityFromSecondEntityManager.items).toHaveLength(1);
        });

        it("deletes the entity from it", async () => {            
            const ds = new DataSource();

            const em = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            em.save(entity);

            expect(em.findOne(TestEntityOne, { id: entity.id })).toBeTruthy();

            em.delete(entity);

            expect(em.findOne(TestEntityOne, { id: entity.id })).toBeNull();
        });

        it("deletes flushed entity from it", async () => {
            const ds = new DataSource();

            const em = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            em.save(entity);

            expect(em.findOne(TestEntityOne, { id: entity.id })).toBeTruthy();

            em.flush();

            em.delete(entity);

            expect(em.findOne(TestEntityOne, { id: entity.id })).toBeNull();
        });

        it("accesses the deleted entity from another entity manager until it gets flushed", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            entityManager.save(entity);

            entityManager.flush();

            entityManager.delete(entity);

            expect(ds.createEntityManager().findOne(TestEntityOne, { id: entity.id })).toBeTruthy();

            entityManager.flush();

            expect(ds.createEntityManager().findOne(TestEntityOne, { id: entity.id })).toBeNull();
        });

        it("cleans up the deleted entity from entity manager after flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            firstEntityManager.save(entity);
            firstEntityManager.flush();

            let savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id });
            let savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();

            secondEntityManager.delete(entity);

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id });
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            secondEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id });
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntityFromFirstEntityManager).toBeNull();
            expect(savedEntityFromSecondEntityManager).toBeNull();

            firstEntityManager.save(entity);
            firstEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id });
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();

            secondEntityManager.flush();

            savedEntityFromFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: entity.id });
            savedEntityFromSecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: entity.id });

            expect(savedEntityFromFirstEntityManager).toBeTruthy();
            expect(savedEntityFromSecondEntityManager).toBeTruthy();
        });

        it("when two entity managers save different entity both entity managers should have access to all entities after flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const firstEntity = new TestEntityOne(1);
            const secondEntity = new TestEntityOne(2);

            firstEntityManager.save(firstEntity);            
            secondEntityManager.save(secondEntity);
            
            let firstEntityFromFirstEntityManagerSavedByFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            let secondEntityFromFirstEntityManagerSavedBySecondEntityManager = firstEntityManager.findOne(TestEntityOne, { id: secondEntity.id });
            let firstEntityFromSecondEntityManagerSavedByFirstEntityManager = secondEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            let secondEntityFromSecondEntityManagerSavedBysecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: secondEntity.id });

            // only the entity manager that saved the entity has access before flush
            expect(firstEntityFromFirstEntityManagerSavedByFirstEntityManager).toBeTruthy();
            expect(secondEntityFromSecondEntityManagerSavedBysecondEntityManager).toBeTruthy();            
            expect(secondEntityFromFirstEntityManagerSavedBySecondEntityManager).toBeNull();
            expect(firstEntityFromSecondEntityManagerSavedByFirstEntityManager).toBeNull();
            
            firstEntityManager.flush();
            secondEntityManager.flush();

            firstEntityFromFirstEntityManagerSavedByFirstEntityManager = firstEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            secondEntityFromFirstEntityManagerSavedBySecondEntityManager = firstEntityManager.findOne(TestEntityOne, { id: secondEntity.id });
            firstEntityFromSecondEntityManagerSavedByFirstEntityManager = secondEntityManager.findOne(TestEntityOne, { id: firstEntity.id });
            secondEntityFromSecondEntityManagerSavedBysecondEntityManager = secondEntityManager.findOne(TestEntityOne, { id: secondEntity.id });

            // all entity managers have access to all entities after flush
            expect(firstEntityFromFirstEntityManagerSavedByFirstEntityManager).toBeTruthy();
            expect(secondEntityFromSecondEntityManagerSavedBysecondEntityManager).toBeTruthy();
            expect(firstEntityFromSecondEntityManagerSavedByFirstEntityManager).toBeTruthy();
            expect(secondEntityFromFirstEntityManagerSavedBySecondEntityManager).toBeTruthy();
        });
        
        it("manages more than one different type of entity", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const testEntityOne = new TestEntityOne(1);
            const testEntityTwo = new TestEntityTwo(1);

            entityManager.save(testEntityOne);
            entityManager.save(testEntityTwo);

            let firstEntity = entityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            let secondEntity = entityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);

            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);

            entityManager.delete(testEntityOne);

            firstEntity = entityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = entityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeNull();

            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);
        });

        it("when two entity managers manage different types of entities the entities should be available for both after flush", async () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const testEntityOne = new TestEntityOne(1);
            const testEntityTwo = new TestEntityTwo(1);

            firstEntityManager.save(testEntityOne);
            secondEntityManager.save(testEntityTwo);

            let firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            let secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeNull();

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);
            expect(firstEntity).toBeNull();

            firstEntityManager.flush();

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);

            secondEntityManager.flush();

            firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);

            // DELETE TEST ENTITY TWO

            firstEntityManager.delete(testEntityTwo);

            firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeNull();

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeTruthy();
            expect(secondEntity).toBeInstanceOf(TestEntityTwo);

            firstEntityManager.flush();

            firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeNull();

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeNull();

            // DELETE TEST ENTITY ONE

            secondEntityManager.delete(testEntityOne);

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeNull();
            expect(secondEntity).toBeNull();

            firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeTruthy();
            expect(firstEntity).toBeInstanceOf(TestEntityOne);
            expect(secondEntity).toBeNull();

            secondEntityManager.flush();

            firstEntity = secondEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = secondEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeNull();
            expect(secondEntity).toBeNull();

            firstEntity = firstEntityManager.findOne(TestEntityOne, { id: testEntityOne.id });
            secondEntity = firstEntityManager.findOne(TestEntityTwo, { id: testEntityTwo.id });

            expect(firstEntity).toBeNull();
            expect(secondEntity).toBeNull();            
        });

        it("doesn't delete an entity when it's not present in the entity manager", () => {
            const ds = new DataSource();
            const firstEntityManager = ds.createEntityManager();
            const secondEntityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            firstEntityManager.save(entity);
            secondEntityManager.delete(entity);

            firstEntityManager.flush();
            secondEntityManager.flush();

            expect(firstEntityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            expect(secondEntityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
        });

        it("doesn't delete an entity that is deleted then saved, the last operation should persist", () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            entityManager.save(entity);
            entityManager.flush();

            entityManager.delete(entity);
            entityManager.save(entity);
            entityManager.flush();

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
        });

        it("deletes an entity that is saved then deleted, the last operation should persist", () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);

            entityManager.save(entity);
            entityManager.delete(entity);
            entityManager.flush();

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();
        });
    });

    describe("Transaction", () => {
        it("persists when everything is fine", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const entity = new TestEntityOne(1);
                
                transactionEntityManager.save(entity);

                transactionEntityManager.flush();

                Promise.resolve();
            });

            const savedEntity = entityManager.findOne(TestEntityOne, { id: 1 });

            expect(savedEntity).toBeTruthy();
        });

        it("persists all flushes when creating new entities", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const firstEntity = new TestEntityOne(1);
                transactionEntityManager.save(firstEntity);
                transactionEntityManager.flush();

                const secondEntity = new TestEntityOne(2);
                transactionEntityManager.save(secondEntity);
                transactionEntityManager.flush();

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            expect(entityManager.findOne(TestEntityOne, { id: 2 })).toBeTruthy();
        });

        it("persists all flushes when deleting entities", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const firstEntity = new TestEntityOne(1);
            entityManager.save(firstEntity);
            entityManager.flush();

            const secondEntity = new TestEntityOne(2);
            entityManager.save(secondEntity);
            entityManager.flush();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                transactionEntityManager.delete(firstEntity);
                transactionEntityManager.flush();

                transactionEntityManager.delete(secondEntity);
                transactionEntityManager.flush();

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();
            expect(entityManager.findOne(TestEntityOne, { id: 2 })).toBeNull();
        });

        it("persists only the flushed object in a transaction", async () => {
            const ds = new DataSource();            

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const firstEntity = new TestEntityOne(1);
                transactionEntityManager.save(firstEntity);
                transactionEntityManager.flush();

                const secondEntity = new TestEntityOne(2);
                transactionEntityManager.save(secondEntity);

                expect(transactionEntityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();

                // inside the transaction even the non flushed entity is available
                expect(transactionEntityManager.findOne(TestEntityOne, { id: 2 })).toBeTruthy();

                Promise.resolve();
            });
            
            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 1 })).toBeTruthy();

            // outside the transaction only the flushed entity is available
            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 2 })).toBeNull();
        });

        it("accesses the saved entity from another entity manager only after the transaction", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();            

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const entity = new TestEntityOne(1);
                transactionEntityManager.save(entity);

                expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();

                transactionEntityManager.flush();

                expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
        });        

        it("gets the flushed object inside the transaction", async () => {
            const ds = new DataSource();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const entity = new TestEntityOne(1);
                
                transactionEntityManager.save(entity);
                transactionEntityManager.flush();

                const savedEntity = transactionEntityManager.findOne(TestEntityOne, { id: 1 });

                expect(savedEntity).toBeTruthy();

                Promise.resolve();
            });
        });

        it("commits when everything is fine without overriding entity flushed before by entity manager created outside the transaction", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                entityManager.save(new TestEntityOne(1));
                entityManager.flush();
                
                transactionEntityManager.save(new TestEntityOne(2));
                transactionEntityManager.flush();

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            expect(entityManager.findOne(TestEntityOne, { id: 2 })).toBeTruthy();
        });

        it("commits when everything is fine without overriding entity flushed after by entity manager created outside the transaction", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            
            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                transactionEntityManager.save(new TestEntityOne(1));
                transactionEntityManager.flush();
                
                entityManager.save(new TestEntityOne(2));
                entityManager.flush();                

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            expect(entityManager.findOne(TestEntityOne, { id: 2 })).toBeTruthy();
        });

        it("doesn't persist the entity if there is an error inside the transaction", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            
            await expect(
                ds.beginTransaction((transactionEntityManager: EntityManager) => {
                    const entity = new TestEntityOne(1);
                    
                    transactionEntityManager.save(entity);

                    transactionEntityManager.flush();

                    throw new Error();
                })
            ).rejects.toThrow(Error);

            const savedEntity = entityManager.findOne(TestEntityOne, { id: 1 });

            expect(savedEntity).toBeNull();
        });

        it("deletes entity inside transaction and it should be no longer available after the transaction", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            const entity = new TestEntityOne(1);

            entityManager.save(entity);
            entityManager.flush();

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                transactionEntityManager.delete(entity);

                const deletedEntity = transactionEntityManager.findOne(TestEntityOne, { id: entity.id });
                expect(deletedEntity).toBeNull();

                transactionEntityManager.flush();

                Promise.resolve();
            });

            const deletedEntity = entityManager.findOne(TestEntityOne, { id: entity.id });
            expect(deletedEntity).toBeNull();
        });
        
        it("the deleted data should still be accessible from another entity manager until it the transaction is committed", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();
            const entity = new TestEntityOne(1);

            entityManager.save(entity);
            entityManager.flush();

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                transactionEntityManager.delete(entity);

                expect(entityManager.findOne(TestEntityOne, { id: entity.id })).toBeTruthy();

                transactionEntityManager.flush();

                expect(entityManager.findOne(TestEntityOne, { id: entity.id })).toBeTruthy();

                Promise.resolve();
            });

            expect(entityManager.findOne(TestEntityOne, { id: entity.id })).toBeNull();
        });

        it("creates a transaction inside a transaction and the created entity should be available to outside transaction only after the inner transaction is committed", async () => {
            const ds = new DataSource();

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                await ds.beginTransaction(async (innerTransactionEntityManager: EntityManager) => {
                    const entity = new TestEntityOne(1);
                    innerTransactionEntityManager.save(entity);

                    expect(transactionEntityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();

                    innerTransactionEntityManager.flush();

                    expect(transactionEntityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();
                });

                expect(transactionEntityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            });
        });

        it("persists entity created in the inner transaction but it doesn't persist the entity created in the outer transaction when there is an error in it", async () => {
            const ds = new DataSource();

            await expect(
                ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                    await ds.beginTransaction(async (innerTransactionEntityManager: EntityManager) => {
                        const innerEntity = new TestEntityOne(1);
                        innerTransactionEntityManager.save(innerEntity);
                        innerTransactionEntityManager.flush();
                    });

                    const outerEntity = new TestEntityOne(2);
                    transactionEntityManager.save(outerEntity);
                    transactionEntityManager.flush();

                    throw new Error();
                })
            ).rejects.toThrow(Error);

            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 1 })).toBeTruthy();
            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 2 })).toBeNull();
        });

        it("doesn't persist anything when there is an error in the inner transaction", async () => {
            const ds = new DataSource();

            await expect(
                ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                    await ds.beginTransaction(async (innerTransactionEntityManager: EntityManager) => {
                        const innerEntity = new TestEntityOne(1);
                        innerTransactionEntityManager.save(innerEntity);
                        innerTransactionEntityManager.flush();

                        throw new Error();
                    });

                    const outerEntity = new TestEntityOne(2);
                    transactionEntityManager.save(outerEntity);
                    transactionEntityManager.flush();                    
                })
            ).rejects.toThrow(Error);

            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 1 })).toBeNull();
            expect(ds.createEntityManager().findOne(TestEntityOne, { id: 2 })).toBeNull();
        });

        it("doesn't delete an entity that is deleted then saved, the last operation should persist", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            const entity = new TestEntityOne(1);
            entityManager.save(entity);
            entityManager.flush();

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                transactionEntityManager.delete(entity);
                transactionEntityManager.flush();

                transactionEntityManager.save(entity);
                transactionEntityManager.flush();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeTruthy();
        });

        it("deletes an entity that is saved then deleted, the last operation should persist", async () => {
            const ds = new DataSource();
            const entityManager = ds.createEntityManager();

            await ds.beginTransaction(async (transactionEntityManager: EntityManager) => {
                const entity = new TestEntityOne(1);
                transactionEntityManager.save(entity);
                transactionEntityManager.flush();
                
                transactionEntityManager.delete(entity);
                transactionEntityManager.flush();
            });

            expect(entityManager.findOne(TestEntityOne, { id: 1 })).toBeNull();
        });
    });
});