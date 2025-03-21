# Zombie Survival Social Network (ZSSN)

## Code challenge for Neurons.

For description of the assignment, look [here](/challenge-description.md)

### Backend:

The backend API is built with `Python`. If it is not available on your system, please install it first. You can do so by visiting the [Python homepage](https://www.python.org/downloads/) and downloading the correct routine from there. If you are on Mac, you might want to use an installer, such as `brew`. Alternatively, if running this over Windows through WSL2, follow the relevant instructions in [this online tutorial](https://medium.com/@charles.guinand/installing-wsl2-python-and-virtual-environments-on-windows-11-with-vs-code-a-comprehensive-guide-32db3c1a5847) - section 2 deals specifically with installation of `Python` on WSL2.

To get started:

- this project is packaged with `uv`. It is recommended to install it globally with
  ```sh
  pipx install uv
  ```
- verify installation with
  ```sh
  which uv
  ```
  > If above command returns blank or errors out, you may need to fix your `PATH` with
  ```sh
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc # or ~/.zshrc for ZSH
  source ~/.bashrc # or ~/.zshrc for ZSH
  ```
- using a terminal, navigate to the [backend](/backend) directory.
  ```sh
  cd backend
  ```
- create and activate Virtual Environment by running
  ```sh
  uv venv
  ```
- install dependencies with
  ```sh
  uv sync
  ```
- run API with

  ```sh
  uvicorn app.main:app --reload
  ```

  > **Note**: In case you are running this on WSL2, you might need to export to the outer world with `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`.

  > **Note**: In case your terminal does not recognize `uvicorn`, run it through `uv` with `uv run uvicorn ...`

Automated tests are available for the API. These can be run by executing

```sh
pytest
```

from the root of the [backend](/backend) folder.

> **Note**: In case your terminal does not recognize `pytest`, run with `uv run pytest`

For more information on the backend and thoughts relating to it, see [the backend guide](/backend/README.md).

### Frontend:

This project is built with `React`, `TypeScript` and `TailwindCSS` running on a `Vite` stack. The project is meant to be run on `Node 22`. If it is not installed, please install it first. `nvm` is recommended for managing your `Node` versions.

To get started:

- using a terminal, navigate to the [frontend](/frontend) directory and run
  ```sh
  npm i
  ```
  to install dependencies
- once the process is done, run `Vite` server with
  ```sh
  npm run dev
  ```
- For production build preview, run
  ```sh
  npm run build
  npm run preview
  ```
  > **Note**: If you are running this on WSL2, you might need to use your network address instead of `localhost`. Your available network addresses will be listed in the terminal upon running `npm run dev`.

For more on the frontend, see [the frontend guide](/frontend/README.md).

## Known issues, limitations and final considerations

**Backend test coverage** is currently not as high as I would like it to be. While the basics are there to cover the API, there is a lot more that can and _should_ be done! All the API endpoints can fail in several ways and coverage for all these scenarios ranges between scant and missing. Getting testing to work at all has been a _significant_ challenge and has taken more time and energy than ideal, which, in the end, limited the amount of tests I was able and willing to write. Well, let it be known that, given the resources, I would obviously aim at a much higher code coverage of the nerve center of the application.

**Frontend test coverage** is, unfortunately, also a sore thumb. I simply ran out of time. Ideally, I would have aspired for a healthy testing pyramid with a layer of `Playwright` or `Cypress` at the top to cover critical business flows, supported by a layer of component tests written with `@testing-library/react` and supported by `MockServiceWorker` and a collection of static mocks. There isn't really any functionality in the app currently that warrants the broad, bottom layer of unit tests that I would write in `Vitest` for stuff like helpers, hooks and general, reusable pure functions; but it's absolutely a layer I would build out as the situation merited it.

**Backend architecture** is probably the area I am most keen to get feedback on, as this was a first in working with Python for me. The language, ecosystem, tooling and patterns are all brand new to me. Although I am obviously not new to software development in general, I am unaware of conventions, patterns and all the foibles that generally take years of investment to absorb. In other words, I am sure there must be gotchas and means to improve that portion of the code. I did the best I could based on word of mouth advice from friends and colleagues, a collection of hastily dug up tutorials and code-alongs, and some AI coding assistance in the editor.

**Frontend architecture** is okay, mostly, but not without regrets. The energy I spent on wrangling Python had to come from somewhere, and it's resulted in a couple of shortcuts taken than I would have liked. The most glaring example of this is the trading panel architecture. Currently, every survivor in the system is presented on-screen simultaneously with their own `SurvivorCard`, which includes their own, unique trading window as well as confirmation dialog when reporting someone as infected. This is stupid and wasteful and there is absolutely no reason why there shouldn't just be 1 dialog for each at the root of the application, which gets shown and populated on demand based on what survivor triggered it. Unfortunately, `Radix-UI` can be a bit peculiar to work with and requires a certain structure to do what it does and I didn't have enough fight in me to bend it to my will or replace it with the _proper_ solution (which would have been a bespoke component backed up by a `Zustand` store to manage it and transfer the necessary data).

**Short-term improvements**
Speaking of obvious improvements, **pagination** and **search** come to mind immediately. The current approach of putting everything on-screen at the same time is fine for a quick prototype, but it obviously does not scale. For the full, proper solution, I would implement pagination and provide a search mechanism, so survivors could narrow down the results on screen. Ideally, I would also provide a means for them to look for other survivors based on inventory search criteria, like "show me all survivors within 10km that have at least 4 ammunition".

Also relevant to mention is a **profile panel** to more easily see who has what in their inventories. The challenge description calls for such one, but I left it as an area of improvement with the argument that, technically, you _can_ view any survivor's inventory by initiating a trade with them (you don't have to commit to it). Also relevant for the profile panel would be a Google maps integration showing where they were located relative to one self.

While we are on the subject of **trading**, I have implemented an endpoint for validating a trade and it is an _obvious_ low-hanging fruit to hook it up to the trading window to give real-time feedback of how balanced a trade is, before committing to it. The trading window itself should not _allow_ a trade to go through (Trade button disabled) until scale balance is satisfied.

**Long-term improvements**
In the longer term, I would have liked to add several features. Amongst them:

- hooking up the app to positional tracking via the browser via the `Geolocation API` to pre-populate the lat/long coordinates
- a large map (probably Google Maps) showing the real-time position of survivors - and reported infected! Over time, this could be expanded to also mark up survivor strongholds, depots, etc. In turn, this could lead to coordination across survivors for organized action of various kinds
- positional geo-locking for sensitive operations; if you want to trade with someone or report them, you need to be within a certain physical distance of them
- visit survivor shortcut button to immediately update one's location to a certain distance to a given survivor
- (localized) infection charts: a dashboard showing the amount of infected by geo location in percentage of known populaton and growth over time - get a heads up for when it's time to go somewhere else and figure out where that somewhere might be!

## Final words

This has been a very interesting assignment. For someone not already well-versed in the whole stack, it's an unreasonably large chunk of work, which has occupied me more than I would like to admit for the past week; but it's been fun and informative! I like a challenge and I like to learn new things! This provided both and I have enjoyed working on it. It's just a lot... particularly for one week; but by requiring a little bit of everything, it really explores a candidate's depth and exposes their comfort zones and weaknesses. In that sense, it's a good challenge - for those that are willing to stick it out!
