from backend.process_user_data import process_incoming_data
from backend.schemas import PredictionFormData
import joblib
import pandas as pd
from model.my_pipline import custom_threshold, prepare_catboost_features

# распаковываем модель из бинарника
model = joblib.load('model/my_model.joblib')


async def predict_view(data: PredictionFormData):
    """
    view-функция для единственного роута, возвращает предсказание
    :param data:
    :return:
    """
    data_df = process_incoming_data(data.dict())
    prediction_proba = float(model.predict_proba(data_df)[0, 1])
    if prediction_proba<custom_threshold:
        response = {
            'text':f'Вероятность того, что клиент уйдёт - {prediction_proba}. Прогноз модели: клиент остаётся'
        }
    else:
        response = {
            'text':f'Вероятность того, что клиент уйдёт - {prediction_proba}, что превышает порог {custom_threshold}. Прогноз модели: клиент уйдёт'
        }

    return response