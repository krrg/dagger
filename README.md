# dagger
io.js server implementing a theoretical DAG based permissions model

## About

We think about permissions as connections between actors and objects via a graph.  Each actor owns a single token, which may be connected to multiple _other_ tokens pertaining to the actor's various roles in the system.  

Every token may be connected to any other token with an action --- provided that the system remains acyclic.  Each time a link is created from _u_ to _v_, we first check if there already exists a link from _v_ to _u_.  If so, the link creation is rejected.  

We want to keep the graph acyclic to eliminate confusing permissions chains that go nowhere.  
