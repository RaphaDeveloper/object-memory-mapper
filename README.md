# Object Memory Mapper

A lightweight in-memory object mapper with transactional support.\
Designed for applications that follow clean architecture, DDD, or
repository patterns --- where you want the **same test suite** to run
against both:

-   A **real repository** (Postgres, Mongo, Dynamo, etc)
-   A **fake in-memory repository**

This library provides a structured in-memory "database" with a datasource that provides access to transactions and entity manager.\
Perfect for unit tests that use fakes instead of mocks, so that it's easier to write tests that are behavior sensitive.

## 🧠 Why Object Memory Mapper?

In many codebases, tests depend on mocks or ad-hoc fake repositories.
These quickly become inconsistent with the real implementation.

**Object Memory Mapper** acts like a mini persistence layer in memory,
supporting:

-   Transactions
-   Consistent read/write semantics
-   Immutability to real simulate the DB

This enables you to:

✔️ Run the same tests against in-memory and real database\
✔️ Replace mocks with real behavior\
✔️ Prototype features quickly\
✔️ Keep domain logic decoupled from infrastructure

## 🚀 Installation

``` bash
npm install object-memory-mapper
# or
yarn add object-memory-mapper
```

## 📦 Quick Example

### Define an entity

``` ts
export class User {
  constructor(private id: string, private name: string) {}
}
```

### Create a Datasource

``` ts
import {
  DataSource
} from "object-memory-mapper";

const ds = new DataSource();

```

### Create an entity manager

``` ts
const em = ds.createEntityManager();
em.save(new User("u1", "Raphael"));
em.flush();
```

### Run a transaction

``` ts
await ds.beginTransaction(async (em) => {
  em.save(new User("u1", "Raphael"));
  em.flush();
});
```

### Query data

``` ts
const em = ds.createEntityManager();
const user = await em.findOne(User, { id: "u1" });
console.log(user?.name); // Raphael
```

## 🔁 Testing Against Memory & Real DB

Define your repository interface:

``` ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

Create two implementations:

``` ts
import {
  EntityManager
} from "object-memory-mapper";

class PostgresUserRepository implements UserRepository {
  // real persistence
}

class InMemoryUserRepository implements UserRepository {
  constructor(private em: EntityManager) {}

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.em.findOne(User, { id }));
  }

  save(user: User): Promise<void> {
    return Promise.resolve(this.em.save(user));
  }
}
```

Same test suite, two backends:

``` ts
import {
  DataSource
} from "object-memory-mapper";

describe.each(["memory", "postgres"])("UserRepository (%s)", (mode) => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = mode === "memory"
      ? new InMemoryUserRepository(new DataSource().createEntityManager())
      : new PostgresUserRepository();
  });

  test("saves and retrieves a user", async () => {
    await repo.save(new User("u1", "Raphael"));
    expect(await repo.findById("u1")).not.toBeNull();
  });
});
```

## 🧩 Core Concepts

### **DataSource**

The **DataSource** is the central persistence layer --- it functions
like an in-memory database.\
All entities ultimately live inside a DataSource unless they are being
modified inside an active transaction.

From a DataSource you can:

-   Create an `EntityManager`
-   Start transactions with `beginTransaction`

------------------------------------------------------------------------

### **createEntityManager**

`createEntityManager()` creates an instance of **EntityManager**, the
object responsible for reading and writing entities.

An `EntityManager` lets you:

-   **get** entities
-   **save** entities
-   **delete** entities

Changes made through an EntityManager are not automatically persisted.\
To apply them, call:

``` ts
em.flush();
```

The EntityManager synchronizes its in-memory changes with the underlying
**persistence target**, which is either:

-   the **DataSource** (when working outside a transaction)
-   a **Transaction** (when inside `beginTransaction`)

------------------------------------------------------------------------

### **beginTransaction**

`beginTransaction()` executes a callback inside a transactional context.

Flow:

1.  A temporary **Transaction** is created
2.  The callback receives an `EntityManager` bound to this Transaction
3.  All changes go into the Transaction instead of the DataSource
4.  If the callback finishes successfully → the Transaction commits
5.  If the callback throws an error → all changes are rolled back

This ensures:

-   No partial state is persisted
-   Errors automatically revert all changes
-   Writes become visible only after a successful commit


## ⚙️ Build Setup

Built with **tsup** for clean CJS + ESM output and generated `.d.ts`
types.

Build with:

``` bash
npm run build
```
