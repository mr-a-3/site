# Local store workspace

- **Start Store.cmd** starts the PC and private phone previews automatically.
- **Stop Store.cmd** stops both previews until you start them again.
- **Private Store.cmd** keeps phone access private. **Share Store.cmd** allows other Wi-Fi visitors.
- The private phone link is saved in `storefront/PHONE-LINK.txt`. Keep it private.

| Folder | Purpose |
| --- | --- |
| `storefront/` | Active website and admin panel. Start with `storefront/PROJECT-MAP.md`. |
| `backups/` | Preserved backups and dependency recovery copies. |
| `archive/2026-11-02-cleanup/` | Retired source, unused images, screenshots and old exports. Manifests record original paths and checksums for recovery. |
| `tooling/` | Node and tools used by the start/stop controls. |

Do not delete `storefront/.wrangler/state`: it contains local accounts, settings, orders and uploaded images. Generated folders such as `dist/` and `public/editorial/` are maintained by the build; edit their source files instead.

Product photos: **Admin → Products → Edit → Product photos**. Set a cover and up to three optional images, apply the draft, then **Save changes**. Removing a photo from a product does not erase an uploaded file from storage.
