"""
роуты приложения
"""
from fastapi import APIRouter
from backend.schemas import PredictionFormData
from backend.views import predict_view

router = APIRouter()

@router.post('/predict')
async def predict(data: PredictionFormData) -> dict:
    """
    возвращает предсказание модели в формате словаря
    """
    return await predict_view(data=data)