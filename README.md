# orbit

A control panel for a Syntopica instance: what every component is doing, what
failed, what is waiting for a human, and how the memory stack moves
information from agent sessions back into agent sessions.

Status: design. See `docs/superpowers/specs/2026-10-01-orbit-design.md`.

orbit is an engine: this repository holds no instance data. Everything it
shows is discovered at runtime from the instance under `SYNTOPICA_DATA`.

License: MIT.
