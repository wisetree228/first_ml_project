# ML-проект для предсказания оттока клиентов


### Сам проект на сервере (с использованием nginx и все как надо) - https://customerchurn.ru
(Если вы в России то выключите VPN перед открытием)

### Демонстрация работы
<img src="demonstration_gif_for_readme/demo.gif" width="700" alt="Demo">

### Идея проекта:

Создать сервис, который использует обученную ML модель чтобы предсказывать уход клиента по его данным

### Технологический стэк:
#### Backend:
- Python 3.12
- FastAPI 0.115.0
- CatBoost, scikit-learn
#### Frontend:
- ReactJS

Датасет - https://www.kaggle.com/code/ybifoundation/telecom-customer-churn-prediction
#### Паттерн проектирования на бэкенде - MVC

#### Для поднятия всего проекта используется docker compose




# Инструкция по локальному запуску 

1) создать виртуальное окружение:

-для виндовс
```commandline
py -m venv venv
```

-для линукса
```commandline
python3 -m venv venv
```

2) активировать:

-для виндовс
```commandline
venv\Scripts\activate
```

-для линукса
```commandline
source venv/bin/activate
```



3) В папке frontend создать ещё файл .env и записать туда
```
ESLINT_NO_DEV_ERRORS=true
DISABLE_ESLINT_PLUGIN=true
```
(это нужно для отключения ошибок eslint)

5) Запустить пайплайн который выгрузит датасет, подготовит данные, обучит модель и упакует её в бинарник (для этого на виндовс выполнить команду ```py -m model.my_pipline```, на линукс ```python3 -m model.my_pipline```)
Дождитесь завершения обучения модели и вывода основных метрик тестирования в консоль

6) Поднять докер (на виндовс просто запустите docker desktop, на линуксе выполните команду ```sudo systemctl start docker```)

7) Выполните команду ```sudo docker compose up --build```

8) Готово! Проект доступен на локальном сервере по адресу http://localhost:3000 (пользовательский фронтенд), к API бэкенда обращаться по http://localhost:8000

### Характеристики (метрики тестирования) модели

         precision    recall  f1-score   support

       0       0.90      0.77      0.83      1294

       1       0.54      0.77      0.63       467



    accuracy                           0.77      1761

    macro avg       0.72      0.77      0.73      1761

    weighted avg    0.81      0.77      0.78      1761



Accuracy:  0.7660

ROC-AUC:   0.8455

PR-AUC:    0.6506



--- Confusion Matrix ---

[[991 303]

 [109 358]]