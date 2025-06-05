# Joi2049 API

A FastAPI server for the Joi2049 game.

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/v1/game/new` - Start a new game
- `GET /api/v1/game/{game_id}` - Get game state
- `POST /api/v1/game/{game_id}/move` - Make a move
- `DELETE /api/v1/game/{game_id}` - End game session

