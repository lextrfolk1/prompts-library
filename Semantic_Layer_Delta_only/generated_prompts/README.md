# Generated Work Prompts — Lextr Semantic Layer Delta (v2.3.0 → v2.11.0)

This directory contains all categorized AI developer work prompts generated wave by wave,
configured with active branch `semantic-feature-delta` and exposed repositories:
- `semantic-service` (Backend Java / Spring Boot / JDBC / OPA / queries.properties)
- `database-migration-platform` (Flyway DDL migrations)
- `frontend-service` (React 18 / TypeScript / MUI / AG Grid)

## Waves Summary

| Wave | Points | Total Sub-tasks | Primary Service Targets |
|---|---|---|---|
| **Wave 1** | LP-01, LP-15 | 2 | `database-migration-platform`, `frontend-service` |
| **Wave 2** | LP-14 | 1 | `semantic-service` |
| **Wave 3** | LP-03, LP-05 | 10 | `semantic-service` |
| **Wave 4** | LP-06, LP-16, LP-17, LP-22, LP-30, LP-31 | 27 | `database-migration-platform`, `frontend-service`, `semantic-service` |
| **Wave 5** | LP-12 | 5 | `semantic-service` |
| **Wave 6** | LP-18, LP-19, LP-23, LP-24, LP-26, LP-28, LP-41, LP-42, LP-43 | 38 | `frontend-service`, `semantic-service` |
| **Wave 7** | LP-20, LP-25, LP-27, LP-29, LP-32, LP-33 | 26 | `database-migration-platform`, `frontend-service`, `semantic-service` |
| **Wave 8 (Global Standards · cross-cutting)** | LP-34, LP-35, LP-36, LP-37, LP-38, LP-39, LP-40 | 14 | `semantic-service` |
| **Wave 9** | LP-44 | 4 | `database-migration-platform`, `frontend-service`, `semantic-service` |

### [Wave 1](./Wave_1/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-01.1** | LP-01 - Apply fixed DDL as Flyway baseline migration | `SQL` | `database-migration-platform` | `semantic-feature-delta` | [LP-01.1_SQL_prompt.md](./Wave_1/LP-01.1_SQL_prompt.md) |
| **LP-15.3** | LP-15 - Tenant theming primitives (logo, CSS, multi-tenant) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-15.3_TS_prompt.md](./Wave_1/LP-15.3_TS_prompt.md) |

### [Wave 2](./Wave_2/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-14.1** | LP-14 - OPA policy bundle: cross-engine + stale + overdue | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-14.1_REGO_prompt.md](./Wave_2/LP-14.1_REGO_prompt.md) |

### [Wave 3](./Wave_3/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-03.1** | LP-03 - Object registration API (producer write) | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-03.1_SQL_prompt.md](./Wave_3/LP-03.1_SQL_prompt.md) |
| **LP-03.2** | LP-03 - Object registration API (producer write) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-03.2_JAVA_prompt.md](./Wave_3/LP-03.2_JAVA_prompt.md) |
| **LP-03.3** | LP-03 - Object registration API (producer write) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-03.3_JAVA_prompt.md](./Wave_3/LP-03.3_JAVA_prompt.md) |
| **LP-03.4** | LP-03 - Object registration API (producer write) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-03.4_JAVA_prompt.md](./Wave_3/LP-03.4_JAVA_prompt.md) |
| **LP-03.5** | LP-03 - Object registration API (producer write) | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-03.5_REGO_prompt.md](./Wave_3/LP-03.5_REGO_prompt.md) |
| **LP-03.6** | LP-03 - Object registration API (producer write) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-03.6_TEST_prompt.md](./Wave_3/LP-03.6_TEST_prompt.md) |
| **LP-05.1** | LP-05 - Object/attribute read & exposure API | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-05.1_SQL_prompt.md](./Wave_3/LP-05.1_SQL_prompt.md) |
| **LP-05.2** | LP-05 - Object/attribute read & exposure API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-05.2_JAVA_prompt.md](./Wave_3/LP-05.2_JAVA_prompt.md) |
| **LP-05.3** | LP-05 - Object/attribute read & exposure API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-05.3_JAVA_prompt.md](./Wave_3/LP-05.3_JAVA_prompt.md) |
| **LP-05.4** | LP-05 - Object/attribute read & exposure API | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-05.4_TEST_prompt.md](./Wave_3/LP-05.4_TEST_prompt.md) |

### [Wave 4](./Wave_4/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-06.1** | LP-06 - Relationship registration + Neo4j projection | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-06.1_SQL_prompt.md](./Wave_4/LP-06.1_SQL_prompt.md) |
| **LP-06.2** | LP-06 - Relationship registration + Neo4j projection | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-06.2_JAVA_prompt.md](./Wave_4/LP-06.2_JAVA_prompt.md) |
| **LP-06.3** | LP-06 - Relationship registration + Neo4j projection | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-06.3_JAVA_prompt.md](./Wave_4/LP-06.3_JAVA_prompt.md) |
| **LP-06.4** | LP-06 - Relationship registration + Neo4j projection | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-06.4_JAVA_prompt.md](./Wave_4/LP-06.4_JAVA_prompt.md) |
| **LP-06.5** | LP-06 - Relationship registration + Neo4j projection | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-06.5_REGO_prompt.md](./Wave_4/LP-06.5_REGO_prompt.md) |
| **LP-06.6** | LP-06 - Relationship registration + Neo4j projection | `CYTO` | `frontend-service` | `semantic-feature-delta` | [LP-06.6_CYTO_prompt.md](./Wave_4/LP-06.6_CYTO_prompt.md) |
| **LP-06.7** | LP-06 - Relationship registration + Neo4j projection | `CYPHER` | `semantic-service` | `semantic-feature-delta` | [LP-06.7_CYPHER_prompt.md](./Wave_4/LP-06.7_CYPHER_prompt.md) |
| **LP-06.8** | LP-06 - Relationship registration + Neo4j projection | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-06.8_TEST_prompt.md](./Wave_4/LP-06.8_TEST_prompt.md) |
| **LP-16.1** | LP-16 - Data Catalog screen (dual tree + search) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-16.1_TS_prompt.md](./Wave_4/LP-16.1_TS_prompt.md) |
| **LP-16.2** | LP-16 - Data Catalog screen (dual tree + search) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-16.2_TS_prompt.md](./Wave_4/LP-16.2_TS_prompt.md) |
| **LP-17.1** | LP-17 - Register Object wizard (5-step) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-17.1_TS_prompt.md](./Wave_4/LP-17.1_TS_prompt.md) |
| **LP-17.2** | LP-17 - Register Object wizard (5-step) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-17.2_TS_prompt.md](./Wave_4/LP-17.2_TS_prompt.md) |
| **LP-22.1** | LP-22 - Attribute pairing registration + resolution API | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-22.1_SQL_prompt.md](./Wave_4/LP-22.1_SQL_prompt.md) |
| **LP-22.2** | LP-22 - Attribute pairing registration + resolution API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-22.2_JAVA_prompt.md](./Wave_4/LP-22.2_JAVA_prompt.md) |
| **LP-22.3** | LP-22 - Attribute pairing registration + resolution API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-22.3_JAVA_prompt.md](./Wave_4/LP-22.3_JAVA_prompt.md) |
| **LP-22.4** | LP-22 - Attribute pairing registration + resolution API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-22.4_JAVA_prompt.md](./Wave_4/LP-22.4_JAVA_prompt.md) |
| **LP-22.5** | LP-22 - Attribute pairing registration + resolution API | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-22.5_TEST_prompt.md](./Wave_4/LP-22.5_TEST_prompt.md) |
| **LP-30.1** | LP-30 - Entity governance-history read API | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-30.1_SQL_prompt.md](./Wave_4/LP-30.1_SQL_prompt.md) |
| **LP-30.2** | LP-30 - Entity governance-history read API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-30.2_JAVA_prompt.md](./Wave_4/LP-30.2_JAVA_prompt.md) |
| **LP-30.3** | LP-30 - Entity governance-history read API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-30.3_JAVA_prompt.md](./Wave_4/LP-30.3_JAVA_prompt.md) |
| **LP-30.4** | LP-30 - Entity governance-history read API | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-30.4_TEST_prompt.md](./Wave_4/LP-30.4_TEST_prompt.md) |
| **LP-31.1** | LP-31 - Data access control (ring-fencing) + data classification | `SQL` | `database-migration-platform / semantic-service` | `semantic-feature-delta` | [LP-31.1_SQL_prompt.md](./Wave_4/LP-31.1_SQL_prompt.md) |
| **LP-31.2** | LP-31 - Data access control (ring-fencing) + data classification | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-31.2_JAVA_prompt.md](./Wave_4/LP-31.2_JAVA_prompt.md) |
| **LP-31.3** | LP-31 - Data access control (ring-fencing) + data classification | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-31.3_JAVA_prompt.md](./Wave_4/LP-31.3_JAVA_prompt.md) |
| **LP-31.4** | LP-31 - Data access control (ring-fencing) + data classification | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-31.4_REGO_prompt.md](./Wave_4/LP-31.4_REGO_prompt.md) |
| **LP-31.5** | LP-31 - Data access control (ring-fencing) + data classification | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-31.5_REGO_prompt.md](./Wave_4/LP-31.5_REGO_prompt.md) |
| **LP-31.6** | LP-31 - Data access control (ring-fencing) + data classification | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-31.6_TEST_prompt.md](./Wave_4/LP-31.6_TEST_prompt.md) |

### [Wave 5](./Wave_5/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-12.1** | LP-12 - Governance workflow approval + typed side-effects | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-12.1_SQL_prompt.md](./Wave_5/LP-12.1_SQL_prompt.md) |
| **LP-12.2** | LP-12 - Governance workflow approval + typed side-effects | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-12.2_JAVA_prompt.md](./Wave_5/LP-12.2_JAVA_prompt.md) |
| **LP-12.3** | LP-12 - Governance workflow approval + typed side-effects | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-12.3_JAVA_prompt.md](./Wave_5/LP-12.3_JAVA_prompt.md) |
| **LP-12.4** | LP-12 - Governance workflow approval + typed side-effects | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-12.4_JAVA_prompt.md](./Wave_5/LP-12.4_JAVA_prompt.md) |
| **LP-12.5** | LP-12 - Governance workflow approval + typed side-effects | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-12.5_TEST_prompt.md](./Wave_5/LP-12.5_TEST_prompt.md) |

### [Wave 6](./Wave_6/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-18.1** | LP-18 - Filter Lookups screen (register/preview/certify/bind) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-18.1_TS_prompt.md](./Wave_6/LP-18.1_TS_prompt.md) |
| **LP-18.2** | LP-18 - Filter Lookups screen (register/preview/certify/bind) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-18.2_TS_prompt.md](./Wave_6/LP-18.2_TS_prompt.md) |
| **LP-19.1** | LP-19 - Relationship view (Cytoscape over Neo4j) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-19.1_TS_prompt.md](./Wave_6/LP-19.1_TS_prompt.md) |
| **LP-19.2** | LP-19 - Relationship view (Cytoscape over Neo4j) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-19.2_TS_prompt.md](./Wave_6/LP-19.2_TS_prompt.md) |
| **LP-19.3** | LP-19 - Relationship view (Cytoscape over Neo4j) | `CYTO` | `frontend-service` | `semantic-feature-delta` | [LP-19.3_CYTO_prompt.md](./Wave_6/LP-19.3_CYTO_prompt.md) |
| **LP-23.1** | LP-23 - Attribute Pairing screen (registry + register + value cache) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-23.1_TS_prompt.md](./Wave_6/LP-23.1_TS_prompt.md) |
| **LP-23.2** | LP-23 - Attribute Pairing screen (registry + register + value cache) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-23.2_TS_prompt.md](./Wave_6/LP-23.2_TS_prompt.md) |
| **LP-24.1** | LP-24 - Data Quality rule catalog + request / observe API | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-24.1_SQL_prompt.md](./Wave_6/LP-24.1_SQL_prompt.md) |
| **LP-24.2** | LP-24 - Data Quality rule catalog + request / observe API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-24.2_JAVA_prompt.md](./Wave_6/LP-24.2_JAVA_prompt.md) |
| **LP-24.3** | LP-24 - Data Quality rule catalog + request / observe API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-24.3_JAVA_prompt.md](./Wave_6/LP-24.3_JAVA_prompt.md) |
| **LP-24.4** | LP-24 - Data Quality rule catalog + request / observe API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-24.4_JAVA_prompt.md](./Wave_6/LP-24.4_JAVA_prompt.md) |
| **LP-24.5** | LP-24 - Data Quality rule catalog + request / observe API | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-24.5_REGO_prompt.md](./Wave_6/LP-24.5_REGO_prompt.md) |
| **LP-24.6** | LP-24 - Data Quality rule catalog + request / observe API | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-24.6_TEST_prompt.md](./Wave_6/LP-24.6_TEST_prompt.md) |
| **LP-26.1** | LP-26 - Data Profiling read API + screen | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-26.1_SQL_prompt.md](./Wave_6/LP-26.1_SQL_prompt.md) |
| **LP-26.2** | LP-26 - Data Profiling read API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-26.2_JAVA_prompt.md](./Wave_6/LP-26.2_JAVA_prompt.md) |
| **LP-26.3** | LP-26 - Data Profiling read API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-26.3_JAVA_prompt.md](./Wave_6/LP-26.3_JAVA_prompt.md) |
| **LP-26.4** | LP-26 - Data Profiling read API + screen | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-26.4_TS_prompt.md](./Wave_6/LP-26.4_TS_prompt.md) |
| **LP-26.5** | LP-26 - Data Profiling read API + screen | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-26.5_TS_prompt.md](./Wave_6/LP-26.5_TS_prompt.md) |
| **LP-26.6** | LP-26 - Data Profiling read API + screen | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-26.6_TEST_prompt.md](./Wave_6/LP-26.6_TEST_prompt.md) |
| **LP-28.1** | LP-28 - Consumption-layer exposure + SDLC promotion API | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-28.1_SQL_prompt.md](./Wave_6/LP-28.1_SQL_prompt.md) |
| **LP-28.2** | LP-28 - Consumption-layer exposure + SDLC promotion API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-28.2_JAVA_prompt.md](./Wave_6/LP-28.2_JAVA_prompt.md) |
| **LP-28.3** | LP-28 - Consumption-layer exposure + SDLC promotion API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-28.3_JAVA_prompt.md](./Wave_6/LP-28.3_JAVA_prompt.md) |
| **LP-28.4** | LP-28 - Consumption-layer exposure + SDLC promotion API | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-28.4_JAVA_prompt.md](./Wave_6/LP-28.4_JAVA_prompt.md) |
| **LP-28.5** | LP-28 - Consumption-layer exposure + SDLC promotion API | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-28.5_REGO_prompt.md](./Wave_6/LP-28.5_REGO_prompt.md) |
| **LP-28.6** | LP-28 - Consumption-layer exposure + SDLC promotion API | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-28.6_TEST_prompt.md](./Wave_6/LP-28.6_TEST_prompt.md) |
| **LP-41.1** | LP-41 - Tenant Workspaces management API + screen | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-41.1_SQL_prompt.md](./Wave_6/LP-41.1_SQL_prompt.md) |
| **LP-41.2** | LP-41 - Tenant Workspaces management API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-41.2_JAVA_prompt.md](./Wave_6/LP-41.2_JAVA_prompt.md) |
| **LP-41.3** | LP-41 - Tenant Workspaces management API + screen | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-41.3_TS_prompt.md](./Wave_6/LP-41.3_TS_prompt.md) |
| **LP-41.4** | LP-41 - Tenant Workspaces management API + screen | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-41.4_TEST_prompt.md](./Wave_6/LP-41.4_TEST_prompt.md) |
| **LP-42.1** | LP-42 - Logical Hierarchies management API + screen [PROPOSED] | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-42.1_SQL_prompt.md](./Wave_6/LP-42.1_SQL_prompt.md) |
| **LP-42.2** | LP-42 - Logical Hierarchies management API + screen [PROPOSED] | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-42.2_JAVA_prompt.md](./Wave_6/LP-42.2_JAVA_prompt.md) |
| **LP-42.3** | LP-42 - Logical Hierarchies management API + screen [PROPOSED] | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-42.3_TS_prompt.md](./Wave_6/LP-42.3_TS_prompt.md) |
| **LP-42.4** | LP-42 - Logical Hierarchies management API + screen [PROPOSED] | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-42.4_TEST_prompt.md](./Wave_6/LP-42.4_TEST_prompt.md) |
| **LP-43.1** | LP-43 - Domain registration + governed AI resolve (deterministic phrase resolution) | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-43.1_SQL_prompt.md](./Wave_6/LP-43.1_SQL_prompt.md) |
| **LP-43.2** | LP-43 - Domain registration + governed AI resolve (deterministic phrase resolution) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-43.2_JAVA_prompt.md](./Wave_6/LP-43.2_JAVA_prompt.md) |
| **LP-43.3** | LP-43 - Domain registration + governed AI resolve (deterministic phrase resolution) | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-43.3_REGO_prompt.md](./Wave_6/LP-43.3_REGO_prompt.md) |
| **LP-43.4** | LP-43 - Domain registration + governed AI resolve (deterministic phrase resolution) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-43.4_TS_prompt.md](./Wave_6/LP-43.4_TS_prompt.md) |
| **LP-43.5** | LP-43 - Domain registration + governed AI resolve (deterministic phrase resolution) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-43.5_TEST_prompt.md](./Wave_6/LP-43.5_TEST_prompt.md) |

### [Wave 7](./Wave_7/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-20.1** | LP-20 - Query Studio (assemble, tag lookup, generate SQL) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-20.1_JAVA_prompt.md](./Wave_7/LP-20.1_JAVA_prompt.md) |
| **LP-20.2** | LP-20 - Query Studio (assemble, tag lookup, generate SQL) | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-20.2_REGO_prompt.md](./Wave_7/LP-20.2_REGO_prompt.md) |
| **LP-20.3** | LP-20 - Query Studio (assemble, tag lookup, generate SQL) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-20.3_TS_prompt.md](./Wave_7/LP-20.3_TS_prompt.md) |
| **LP-20.4** | LP-20 - Query Studio (assemble, tag lookup, generate SQL) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-20.4_TS_prompt.md](./Wave_7/LP-20.4_TS_prompt.md) |
| **LP-20.5** | LP-20 - Query Studio (assemble, tag lookup, generate SQL) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-20.5_TEST_prompt.md](./Wave_7/LP-20.5_TEST_prompt.md) |
| **LP-25.1** | LP-25 - Data Quality screen (matrix + rules + plain-English request) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-25.1_TS_prompt.md](./Wave_7/LP-25.1_TS_prompt.md) |
| **LP-25.2** | LP-25 - Data Quality screen (matrix + rules + plain-English request) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-25.2_TS_prompt.md](./Wave_7/LP-25.2_TS_prompt.md) |
| **LP-27.1** | LP-27 - Data Observability signal ingest + correlation API + screen | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-27.1_SQL_prompt.md](./Wave_7/LP-27.1_SQL_prompt.md) |
| **LP-27.2** | LP-27 - Data Observability signal ingest + correlation API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-27.2_JAVA_prompt.md](./Wave_7/LP-27.2_JAVA_prompt.md) |
| **LP-27.3** | LP-27 - Data Observability signal ingest + correlation API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-27.3_JAVA_prompt.md](./Wave_7/LP-27.3_JAVA_prompt.md) |
| **LP-27.4** | LP-27 - Data Observability signal ingest + correlation API + screen | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-27.4_JAVA_prompt.md](./Wave_7/LP-27.4_JAVA_prompt.md) |
| **LP-27.5** | LP-27 - Data Observability signal ingest + correlation API + screen | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-27.5_REGO_prompt.md](./Wave_7/LP-27.5_REGO_prompt.md) |
| **LP-27.6** | LP-27 - Data Observability signal ingest + correlation API + screen | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-27.6_TS_prompt.md](./Wave_7/LP-27.6_TS_prompt.md) |
| **LP-27.7** | LP-27 - Data Observability signal ingest + correlation API + screen | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-27.7_TS_prompt.md](./Wave_7/LP-27.7_TS_prompt.md) |
| **LP-27.8** | LP-27 - Data Observability signal ingest + correlation API + screen | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-27.8_TEST_prompt.md](./Wave_7/LP-27.8_TEST_prompt.md) |
| **LP-29.1** | LP-29 - Downstream Consumption screen (exposure + SDLC promotion) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-29.1_TS_prompt.md](./Wave_7/LP-29.1_TS_prompt.md) |
| **LP-29.2** | LP-29 - Downstream Consumption screen (exposure + SDLC promotion) | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-29.2_TS_prompt.md](./Wave_7/LP-29.2_TS_prompt.md) |
| **LP-32.1** | LP-32 - Logical→Physical resolution API for downstream engines | `SQL` | `semantic-service` | `semantic-feature-delta` | [LP-32.1_SQL_prompt.md](./Wave_7/LP-32.1_SQL_prompt.md) |
| **LP-32.2** | LP-32 - Logical→Physical resolution API for downstream engines | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-32.2_JAVA_prompt.md](./Wave_7/LP-32.2_JAVA_prompt.md) |
| **LP-32.3** | LP-32 - Logical→Physical resolution API for downstream engines | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-32.3_JAVA_prompt.md](./Wave_7/LP-32.3_JAVA_prompt.md) |
| **LP-32.4** | LP-32 - Logical→Physical resolution API for downstream engines | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-32.4_REGO_prompt.md](./Wave_7/LP-32.4_REGO_prompt.md) |
| **LP-32.5** | LP-32 - Logical→Physical resolution API for downstream engines | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-32.5_TEST_prompt.md](./Wave_7/LP-32.5_TEST_prompt.md) |
| **LP-33.1** | LP-33 - External rule-engine output ingest | `SQL` | `database-migration-platform / semantic-service` | `semantic-feature-delta` | [LP-33.1_SQL_prompt.md](./Wave_7/LP-33.1_SQL_prompt.md) |
| **LP-33.2** | LP-33 - External rule-engine output ingest | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-33.2_JAVA_prompt.md](./Wave_7/LP-33.2_JAVA_prompt.md) |
| **LP-33.3** | LP-33 - External rule-engine output ingest | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-33.3_JAVA_prompt.md](./Wave_7/LP-33.3_JAVA_prompt.md) |
| **LP-33.4** | LP-33 - External rule-engine output ingest | `REGO` | `semantic-service` | `semantic-feature-delta` | [LP-33.4_REGO_prompt.md](./Wave_7/LP-33.4_REGO_prompt.md) |

### [Wave 8 (Global Standards · cross-cutting)](./Wave_8__Global_Standards___cross_cutting/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-34.1** | LP-34 - OpenAPI/Swagger documentation alignment (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-34.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-34.1_JAVA_prompt.md) |
| **LP-34.2** | LP-34 - OpenAPI/Swagger documentation alignment (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-34.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-34.2_TEST_prompt.md) |
| **LP-35.1** | LP-35 - Logging standardization + diagnostics hardening (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-35.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-35.1_JAVA_prompt.md) |
| **LP-35.2** | LP-35 - Logging standardization + diagnostics hardening (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-35.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-35.2_TEST_prompt.md) |
| **LP-36.1** | LP-36 - Datasource integration + JDBC bean completion (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-36.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-36.1_JAVA_prompt.md) |
| **LP-36.2** | LP-36 - Datasource integration + JDBC bean completion (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-36.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-36.2_TEST_prompt.md) |
| **LP-37.1** | LP-37 - Spring Cloud Config integration hardening (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-37.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-37.1_JAVA_prompt.md) |
| **LP-37.2** | LP-37 - Spring Cloud Config integration hardening (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-37.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-37.2_TEST_prompt.md) |
| **LP-38.1** | LP-38 - Global exception handling standardization (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-38.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-38.1_JAVA_prompt.md) |
| **LP-38.2** | LP-38 - Global exception handling standardization (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-38.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-38.2_TEST_prompt.md) |
| **LP-39.1** | LP-39 - Test coverage + completeness gate (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-39.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-39.1_JAVA_prompt.md) |
| **LP-39.2** | LP-39 - Test coverage + completeness gate (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-39.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-39.2_TEST_prompt.md) |
| **LP-40.1** | LP-40 - Application observability + resilience hooks (cross-cutting) | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-40.1_JAVA_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-40.1_JAVA_prompt.md) |
| **LP-40.2** | LP-40 - Application observability + resilience hooks (cross-cutting) | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-40.2_TEST_prompt.md](./Wave_8__Global_Standards___cross_cutting/LP-40.2_TEST_prompt.md) |

### [Wave 9](./Wave_9/)
| Sub-Task | Logic Point | Language | Primary Target | Branch | File |
|---|---|---|---|---|---|
| **LP-44.1** | LP-44 - Attribute promotion (report-local derived → governed) [PROPOSED] | `SQL` | `database-migration-platform / semantic-service` | `semantic-feature-delta` | [LP-44.1_SQL_prompt.md](./Wave_9/LP-44.1_SQL_prompt.md) |
| **LP-44.2** | LP-44 - Attribute promotion (report-local derived → governed) [PROPOSED] | `JAVA` | `semantic-service` | `semantic-feature-delta` | [LP-44.2_JAVA_prompt.md](./Wave_9/LP-44.2_JAVA_prompt.md) |
| **LP-44.3** | LP-44 - Attribute promotion (report-local derived → governed) [PROPOSED] | `TS` | `frontend-service` | `semantic-feature-delta` | [LP-44.3_TS_prompt.md](./Wave_9/LP-44.3_TS_prompt.md) |
| **LP-44.4** | LP-44 - Attribute promotion (report-local derived → governed) [PROPOSED] | `TEST` | `semantic-service` | `semantic-feature-delta` | [LP-44.4_TEST_prompt.md](./Wave_9/LP-44.4_TEST_prompt.md) |
