# Zombie Survival Social Network (ZSSN)

## Code challenge for Neurons.

For description of work, look [here](/challenge-description.md)

### Frontend:

This project is built with `React`, `TypeScript` and `TailwindCSS` running on a `Vite` stack. The project is meant to be run on `Node 22`. If it is not installed, please install it first. `nvm` is recommended for managing your `Node` versions.

To get started:
****
- using a terminal, navigate to the [frontend](/frontend) directory and run
  ```
  npm i
  ```
  to install dependencies
- once the process is done, run `Vite` server with
  ```
  npm run dev
  ```
- For production build preview, run
  ```
  npm run build
  npm run preview
  ```

### Backend:

The backend API is built with `Python`. If it is not available on your system, please install it first. You can do so by visiting the [Python homepage](https://www.python.org/downloads/) and downloading the correct routine from there. Alternatively, if running this over Windows through WSL2, follow the relevant instructions in [this online tutorial](https://medium.com/@charles.guinand/installing-wsl2-python-and-virtual-environments-on-windows-11-with-vs-code-a-comprehensive-guide-32db3c1a5847) - section 2 deals specifically with installation of `Python` on WSL2.

To get started:

- using a terminal, navigate to the [backend](/backend) directory.
- create and activate Virtual Environment by running
  ```sh
  python -m venv .venv
  source .venv/bin/activate # on macOS/Linux/WSL2
  .venv\Scripts\activate    # on Windows
  ```
  > Note: If you don't have `python` and `pip` aliased, you might need to refer to them as `python3` and `pip3` respectively.
- install `uv` with
  ```
  pip install uv
  ```
- install dependencies with
  ```
  uv sync
  ```
- run API with
  ```
  uvicorn main:app --reload
  ```
