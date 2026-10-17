"""
pipeline training and saving in .joblib file
"""
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score, classification_report, average_precision_score, accuracy_score, \
    confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer
import joblib

from model.preprocessor import prepare_catboost_features

# dataset: https://www.kaggle.com/code/ybifoundation/telecom-customer-churn-prediction
df = pd.read_csv('https://github.com/YBIFoundation/Dataset/raw/main/TelecomCustomerChurn.csv')
# print(df.describe())
# print(df.info())

def clean_telco_data(df):
    df = df.copy()

    # Удаляем ID клиента
    if 'customerID' in df.columns:
        df = df.drop(columns=['customerID'])

    # TotalCharges содержит пробелы " " для новых клиентов. Меняем на NaN и переводим в float
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')

    # Переводим целевую переменную Churn в 0 и 1, если она есть
    if 'Churn' in df.columns:
        df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

    return df

df = clean_telco_data(df)

y = df['Churn']
X = df.drop(['Churn'],axis=1)

x_train, x_test, y_train, y_test = train_test_split(X, y, stratify=y, random_state=42)

cat_features = X.select_dtypes(include=['object']).columns.tolist()
num_features = X.select_dtypes(include=['number']).columns.tolist()





# Обернем предобработку в Pipeline
preprocessor = Pipeline(steps=[
    ('prepare_cats', FunctionTransformer(prepare_catboost_features))
])

# Итоговый полный пайплайн (предобработка + модель)
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', CatBoostClassifier(
        iterations=500,
        learning_rate=0.03,
        depth=6,
        eval_metric='AUC',
        cat_features=cat_features, # Передаем список категориальных колонок в CatBoost!
        random_seed=42,
        verbose=100
    ))
])


custom_threshold = 0.3


# обучаем
if __name__ == "__main__":
    pipeline.fit(x_train, y_train)

    # y_pred = pipeline.predict(x_test)
    y_proba = pipeline.predict_proba(x_test)[:, 1]


    # 3. Получаем новые предсказания: если вероятность >= 0.3, то 1, иначе 0
    y_pred = (y_proba >= custom_threshold).astype(int)


    # оцениваем метрики
    # Базовый отчет: Precision, Recall, F1-score по каждому классу + Accuracy
    print("--- Classification Report ---")
    print(classification_report(y_test, y_pred))

    # Вероятностные метрики (ROC-AUC и PR-AUC)
    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba) # PR-AUC (Area under Precision-Recall curve)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Accuracy:  {accuracy:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")

    # Матрица ошибок (Confusion Matrix)
    print("\n--- Confusion Matrix ---")
    print(confusion_matrix(y_test, y_pred))

    # упаковываем
    filename = 'my_model.joblib'
    joblib.dump(pipeline, filename)
'''
Final scores:
--- Classification Report ---

              precision    recall  f1-score   support



           0       0.90      0.77      0.83      1294

           1       0.54      0.77      0.63       467



    accuracy                           0.77      1761

   macro avg       0.72      0.77      0.73      1761

weighted avg       0.81      0.77      0.78      1761



Accuracy:  0.7660

ROC-AUC:   0.8455

PR-AUC:    0.6506



--- Confusion Matrix ---

[[991 303]

 [109 358]]


'''