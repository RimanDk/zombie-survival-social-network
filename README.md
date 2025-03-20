# Zombie Survival Social Network (ZSSN)

## Code challenge for Neurons.

For description of work, look [here](/challenge-description.md)

### Backend:

The backend API is built with `Python`. If it is not available on your system, please install it first. You can do so by visiting the [Python homepage](https://www.python.org/downloads/) and downloading the correct routine from there. Alternatively, if running this over Windows through WSL2, follow the relevant instructions in [this online tutorial](https://medium.com/@charles.guinand/installing-wsl2-python-and-virtual-environments-on-windows-11-with-vs-code-a-comprehensive-guide-32db3c1a5847) - section 2 deals specifically with installation of `Python` on WSL2.

To get started:

- install `uv` package manager globally with
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

### Frontend:

This project is built with `React`, `TypeScript` and `TailwindCSS` running on a `Vite` stack. The project is meant to be run on `Node 22`. If it is not installed, please install it first. `nvm` is recommended for managing your `Node` versions.

To get started:

---

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
