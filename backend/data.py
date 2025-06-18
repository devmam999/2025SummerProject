from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SettingsData(BaseModel):
    driveTimes: list[str]
    foodPreference: str
    carModel: str
    numDays: int

@app.post("/save-settings")
async def save_settings(data: SettingsData):
    print("Received settings:", data)
    return {"message": "Settings saved successfully"}
