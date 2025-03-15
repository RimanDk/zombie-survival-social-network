# API endpoints
- Create new survivor (takes a name, age, gender, location and list of inventory items - throw error if any of these are missing)
- List survivors (should filter out survivors with a report count higher than equals 3 - make this take an optional parameter for filtering based on freetext name for search? Paginated?)
- Update survivor inventory (should take incoming and outgoing items and cross-check that the added value of incoming items equals added value of outgoing items; throw error if not. Should also verify that neither party is infected)
- Update survivor location (must be a valid lat/lon and update recipient must not be infected)
- Flag survivor as infected (should take a reporter id and timestamp. Decline multiple reports from same source)

## Features/Notes
- Survivors with more than 3 "strikes" (reports of infection) are filtered out from the overview and cannot be selected directly (via ID)
- Trades have to be even in value swap
- Survivors cannot alter their inventories by other means than trades. Given that trades are always of equal value, it means inventories are static in "size"/"capacity" from creation till irrelevance (0 sum game)
- A survivor that is inactive should no longer be able to update their location (as they are technically no longer a survivor, since they are infected)