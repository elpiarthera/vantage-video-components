# NOTICE — Upstream Attribution

## remocn (upstream)

**Project**: remocn — shadcn registry for Remotion
**Repository**: https://github.com/kapishdima/remocn
**License**: MIT
**Original author**: Dmytro Kapish (@kapishdima) and contributors

This repository (`vantage-video-components`) is a fork of remocn. The original MIT license is retained in `LICENSE`. All upstream component code was created by the remocn contributors.

### Upstream contributors (at time of fork, 2026-06-13)

- Dmytro Kapish (@kapishdima) — primary author and maintainer
- Contributors listed at https://github.com/kapishdima/remocn/graphs/contributors

### What this fork changes

1. Package name and metadata updated to `vantage-video-components`.
2. Brand tokens aligned to ElPi / VantageOS design system (OKLCH dark canvas, warm amber accent, Cormorant Display / Georgia typography stack).
3. `"use client"` directives removed from component files (incompatible with Remotion render context).
4. White background defaults replaced with transparent or prop-controlled backgrounds.
5. Geist Sans CSS variable references replaced with self-hosted or `@remotion/google-fonts` loaded fonts.
6. Registry endpoint namespace updated from `@remocn/*` to `@vantage-video/*`.

The upstream remocn project remains MIT-licensed and continues to evolve at https://github.com/kapishdima/remocn. This fork is independently maintained under the ElPi Corp umbrella.

### Imported sub-folder attribution

`.claude/skills/remotion-best-practices/` — imported from kapishdima/remocn @ .agents/skills/remotion-best-practices (MIT, see upstream LICENSE).

---

MIT License

Copyright (c) 2024 Dmytro Kapish

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
