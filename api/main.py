# main.py
from fastapi import FastAPI, HTTPException, Body
from sqlmodel import Field, Session, SQLModel, create_engine, select, SQLModel, JSON, Column
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel
import json

app = FastAPI(title="Joi Cloud Storage")

DATABASE_URL = "sqlite:///./cloud.db"
engine = create_engine(DATABASE_URL, echo=True)

# Define models for different data types
class StorageItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    value: str  # JSON string of the stored data

# Create tables
SQLModel.metadata.create_all(engine)


@app.get("/storage/{key}")
def get_item(key: str):
    """Get a single item by key"""
    with Session(engine) as s:
        item = s.exec(select(StorageItem).where(StorageItem.key == key)).first()
        if not item:
            return None
        try:
            # Try to parse the JSON but return raw value if it fails
            return json.loads(item.value)
        except:
            return item.value

@app.post("/storage/{key}")
def set_item(key: str, value: Any = Body(...)):
    """Set a value for a key"""
    with Session(engine) as s:
        # Check if item exists first
        item = s.exec(select(StorageItem).where(StorageItem.key == key)).first()
        
        # Convert value to JSON string
        value_str = json.dumps(value)
        
        if item:
            item.value = value_str
        else:
            item = StorageItem(key=key, value=value_str)
            s.add(item)
            
        s.commit()
        s.refresh(item)
        return {"key": key, "saved": True}

@app.get("/storage")
def get_all_items():
    """Get all stored items"""
    with Session(engine) as s:
        items = s.exec(select(StorageItem)).all()
        result = {}
        for item in items:
            try:
                # Try to parse JSON
                result[item.key] = json.loads(item.value)
            except:
                result[item.key] = item.value
        return result

@app.delete("/storage/{key}")
def delete_item(key: str):
    """Delete an item by key"""
    with Session(engine) as s:
        item = s.exec(select(StorageItem).where(StorageItem.key == key)).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with key {key} not found")
        s.delete(item)
        s.commit()
        return {"key": key, "deleted": True}

@app.post("/storage/multi")
def multi_set(items: Dict[str, Any] = Body(...)):
    """Set multiple items at once"""
    with Session(engine) as s:
        for key, value in items.items():
            # Convert value to JSON string
            value_str = json.dumps(value)
            
            # Check if item exists
            item = s.exec(select(StorageItem).where(StorageItem.key == key)).first()
            
            if item:
                item.value = value_str
            else:
                item = StorageItem(key=key, value=value_str)
                s.add(item)
        
        s.commit()
        return {"saved": True, "count": len(items)}

@app.post("/storage/multi/get")
def multi_get(keys: List[str] = Body(...)):
    """Get multiple items at once"""
    with Session(engine) as s:
        result = {}
        for key in keys:
            item = s.exec(select(StorageItem).where(StorageItem.key == key)).first()
            if item:
                try:
                    result[key] = json.loads(item.value)
                except:
                    result[key] = item.value
        return result

# Legacy support for old endpoint
@app.get("/items")
def list_items():
    with Session(engine) as s:
        items = s.exec(select(StorageItem)).all()
        return [{"id": item.id, "text": item.key} for item in items]

@app.post("/items")
def add_item(item_data: Dict[str, Any] = Body(...)):
    with Session(engine) as s:
        key = item_data.get("text", "")
        if not key:
            raise HTTPException(status_code=400, detail="Text field is required")
            
        item = StorageItem(key=key, value=json.dumps(item_data))
        s.add(item)
        s.commit()
        s.refresh(item)
        return {"id": item.id, "text": key}
