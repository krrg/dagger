# dagger
Node implementation of a DAG based permissions model.  This code requires at least Node 7.  [NodeSource](https://github.com/nodesource/distributions) is a great way to get the latest Node for Linux.

## Theoretics

We think about permissions as connections between actors and objects via a graph.  Each actor owns a single token, which may be connected to multiple _other_ tokens pertaining to the actor's various roles in the system.  

Every token may be connected to any other token with an action --- provided that the system remains acyclic.  Each time a link is created from _u_ to _v_, we first check if there already exists a link from _v_ to _u_.  If so, the link creation is rejected.  

We want to keep the graph acyclic to eliminate confusing permissions chains that go nowhere.  

## Running the code
Your version of Node must support `async` and `await`.  In Node 7, you can use the `--harmony` flag.  With newer versions of Node 7 (> 7.10), the harmony flag is no longer required.  Or, you can just use Node 8 and life will be simple.

You can test the model code with mocha using `npm test`.  The attached express server isn't hooked up (yet).

## Redis Schema
The following is a rough sketch of the schema being used in Redis:
![Redis Schema Sketch](https://github.com/krrg/dagger/blob/master/redis-schema.png)

## Future Ideas
A more appropriate database for this type of system might be something like [Neo4j](https://neo4j.com), as it is more optimized for modeling graphs.


