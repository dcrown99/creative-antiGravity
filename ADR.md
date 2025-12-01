# Architecture Decision Records (ADR)

## ADR-001: Monorepo Adoption & UI Unification
* **Date:** 2025-11-30
* **Status:** Accepted
* **Context:** The project consisted of multiple isolated Next.js applications with duplicated UI code.
* **Decision:** Adopt **TurboRepo** and create a shared **`packages/ui`** library (Shadcn UI).

## ADR-002: Testing Strategy
* **Date:** 2025-11-30
* **Status:** Accepted
* **Decision:** Use **Jest** for Unit Testing and **Playwright** for E2E Testing.

## ADR-003: Legacy Containment
* **Date:** 2025-11-30
* **Status:** Accepted
* **Context:** `manga-downloader` relies on legacy Windows batch scripts.
* **Decision:** Exclude it from the strict modernization scope.

## ADR-004: Infrastructure Strategy Adjustment (Host Mounts)
* **Date:** 2025-11-30
* **Status:** Accepted
* **Context:** Initially attempted to run `rclone` within a Docker container to mount Google Drive.
* **Problem:** Docker Desktop for Windows has poor stability with FUSE/privileged containers, leading to mount failures.
* **Decision:**
    1.  Remove the `rclone` service from Docker.
    2.  Rely on the Host OS (Windows) to mount Google Drive (e.g., via Google Drive Desktop).
    3.  Use **Bind Mounts** to pass the Host's drive path (e.g., `G:/...`) directly to containers.
* **Consequences:**
    * (+) Drastically improved stability and IO performance.
    * (-) `docker-compose.yml` becomes environment-dependent (requires manual path configuration by user).
