from pydantic import BaseModel, Field
from typing import Union

class PredictionFormData(BaseModel):
    Gender: str = Field(..., description="Пол клиента (например, Male/Female)")
    SeniorCitizen: int = Field(..., ge=0, le=1, description="Является ли пенсионером (0 или 1)")
    Partner: str = Field(..., description="Есть ли партнер (Yes/No)")
    Dependents: str = Field(..., description="Есть ли иждивенцы (Yes/No)")
    Tenure: int = Field(..., ge=0, description="Количество месяцев сотрудничества с компанией")
    PhoneService: str = Field(..., description="Наличие телефонной связи (Yes/No)")
    MultipleLines: str = Field(..., description="Множественные линии (Yes/No/No phone service)")
    InternetService: str = Field(..., description="Тип интернет-соединения (DSL/Fiber optic/No)")
    OnlineSecurity: str = Field(..., description="Блокировка опасных сайтов (Yes/No/No internet service)")
    OnlineBackup: str = Field(..., description="Облачный бэкап (Yes/No/No internet service)")
    DeviceProtection: str = Field(..., description="Страховка оборудования (Yes/No/No internet service)")
    TechSupport: str = Field(..., description="Техподдержка (Yes/No/No internet service)")
    StreamingTV: str = Field(..., description="Стриминговое ТВ (Yes/No/No internet service)")
    StreamingMovies: str = Field(..., description="Стриминговые фильмы (Yes/No/No internet service)")
    Contract: str = Field(..., description="Тип контракта (Month-to-month / One year / Two year)")
    PaperlessBilling: str = Field(..., description="Электронный чек (Yes/No)")
    PaymentMethod: str = Field(..., description="Способ оплаты")
    MonthlyCharges: float = Field(..., ge=0.0, description="Ежемесячный платеж")
    TotalCharges: Union[str, float] = Field(
        ...,
        description="Общая сумма платежей (принимаем строку или число, так как у новых клиентов бывают пробелы)"
    )

    class Config:
        # Разрешаем передавать данные по ключам словаря
        populate_by_name = True