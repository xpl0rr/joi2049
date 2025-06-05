# main.py
from fastapi import FastAPI, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select

app = FastAPI(title="Cloud TODO")

DATABASE_URL = "sqlite:///./cloud.db"      # swapped to a managed DB later
engine = create_engine(DATABASE_URL, echo=True)

class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str

SQLModel.metadata.create_all(engine)

@app.get("/items")
def list_items():
    with Session(engine) as s:
        return s.exec(select(Item)).all()

@app.post("/items")
def add_item(item: Item):
    with Session(engine) as s:
        s.add(item)
        s.commit()
        s.refresh(item)
        return item
