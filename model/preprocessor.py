def prepare_catboost_features(df):
    df = df.copy()
    # Находим все текстовые и категориальные колонки динамически
    cat_features = df.select_dtypes(include=['object', 'category']).columns.tolist()

    for col in cat_features:
        df[col] = df[col].astype(str).fillna('Missing')
    return df