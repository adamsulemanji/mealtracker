import os
import uuid
import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from mangum import Mangum

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "https://mealtracker.adamsulemanji.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

handler = Mangum(app)

table_name = os.environ.get("TABLE_NAME", "MyTable")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)

class MealInfo(BaseModel):
    mealID: Optional[str] = None
    mealName: str
    mealType: str
    eatingOut: bool
    date: datetime
    note: str
    tags: List[str] = []

    class Config:
        json_encoders = { datetime: lambda dt: dt.isoformat() }

@app.get("/")
def read_root():
    return {"status": True, "items": {"Hello": "World"}}

@app.get("/meals/{mealID}")
def get_item(mealID: str):
    response = table.get_item(Key={"mealID": mealID})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": True, "items": item}

@app.post("/meals")
def create_item(item: MealInfo):
    if not item.mealID:
        item.mealID = str(uuid.uuid4())
    item_data = item.dict()
    item_data["date"] = item_data["date"].isoformat()
    table.put_item(Item=item_data)
    return {"status": True, "items": item_data}

@app.put("/meals/{mealID}")
def update_item(mealID: str, item: MealInfo):
    response = table.get_item(Key={"mealID": mealID})
    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Item not found")
    updated_date = item.date.isoformat()
    table.update_item(
        Key={"mealID": mealID},
        UpdateExpression=(
            "SET mealName = :mealName, mealType = :mealType, "
            "eatingOut = :eatingOut, #d = :date, note = :note, tags = :tags"
        ),
        ExpressionAttributeNames={"#d": "date"},
        ExpressionAttributeValues={
            ":mealName": item.mealName,
            ":mealType": item.mealType,
            ":eatingOut": item.eatingOut,
            ":date": updated_date,
            ":note": item.note,
            ":tags": item.tags
        },
        ReturnValues="ALL_NEW"
    )
    item_data = item.dict()
    item_data["date"] = updated_date
    return {"status": True, "items": item_data}

@app.delete("/meals/{mealID}")
def delete_item(mealID: str):
    response = table.get_item(Key={"mealID": mealID})
    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Item not found")
    table.delete_item(Key={"mealID": mealID})
    return {"status": True, "items": {"mealID": mealID, "message": f"Item with ID '{mealID}' deleted"}}

@app.get("/meals", response_model=Dict[str, Any])
def get_all_items():
    response = table.scan()
    items = response.get("Items", [])
    meal_infos = []
    for i in items:
        i["date"] = datetime.fromisoformat(i["date"])
        meal_infos.append(MealInfo(**i).dict())
        meal_infos[-1]["date"] = meal_infos[-1]["date"].isoformat()
    return {"status": True, "items": meal_infos}

