"""
обработка входящих от пользователя данных
"""
import pandas as pd


def process_incoming_data(data_dict: dict) -> pd.DataFrame:
    """
    Принимает словарь с данными от пользователя (из Pydantic-схемы),
    конвертирует в DataFrame и приводит типы колонок к корректным (числа, строки).
    """
    #  создаем DataFrame из словаря
    df = pd.DataFrame([data_dict])

    # список числовых колонок, которые модель ожидает увидеть в виде чисел
    numeric_cols = ['SeniorCitizen', 'Tenure', 'MonthlyCharges', 'TotalCharges']

    for col in numeric_cols:
        if col in df.columns:
            # errors='coerce' превратит пустые строки или невалидный текст в NaN,
            # что позволит пайплайну безопасно их обработать
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # гарантируем, что категориальные/текстовые поля имеют строковый тип
    object_cols = df.select_dtypes(include=['object']).columns
    for col in object_cols:
        df[col] = df[col].astype(str).fillna('Missing')

    return df