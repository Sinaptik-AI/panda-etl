# Flask App README

This repository contains a Flask web application.

## Prerequisites

- Python 3.9+
- Poetry (for managing dependencies)

## Installation

1. Open the `/backend` directory in a terminal:

   ```
   cd backend
   ```

2. Install dependencies using Poetry:
   ```
   poetry install
   ```

## Running the App

To run the Flask app locally:

1. Activate the virtual environment (if not already activated):

   ```
   poetry shell
   ```

2. Run the Flask app:
   ```
   poetry run flask run --port 5328
   ```

The app should now be running locally on port 5328.

## Accessing the App

Open a web browser and go to `http://localhost:5328` to view the app.

## Structure

- `app.py`: Main Flask application file

## Dependencies

All Python dependencies are listed in `pyproject.toml`. Poetry manages these dependencies.

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to customize this README further based on additional features or specifics of your Flask application.
