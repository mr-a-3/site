# Form before the editorial redesign

`source.zip` contains the complete tracked source at the commit in `commit.txt`.
`local-data/` contains the stopped local preview's database and uploaded images.

To restore, stop the local server first. Extract the source into a separate folder,
install its locked dependencies, and copy `local-data/` into `.wrangler/state/` in
that folder. Keep the current checkout until the restored copy has been checked.
The hosted site and its database were not changed by this local backup.

Source archive SHA-256:
`D438936494CCE54D6FF82C57ACE1293BAE9F53774DE96E19465D527F1ACC8691`
