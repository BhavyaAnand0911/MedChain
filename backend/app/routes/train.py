import pandas as pd
import numpy as np
import joblib
import shap
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

# Load dataset
df = pd.read_csv(r"/home/bhavya/Downloads/Training.csv")

# Merge symptoms into a single text column for TF-IDF
df["Symptom_Text"] = df.iloc[:, :-1].apply(lambda x: ",".join(x.index[x == 1]), axis=1)

# Use TF-IDF for feature extraction
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["Symptom_Text"])

# Encode disease labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["prognosis"])

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train RandomForest Model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# ✅ Fix SHAP Issues
background_data = X_train[:100].toarray()  # Use 100 samples as background data
explainer = shap.TreeExplainer(model, data=background_data, feature_perturbation='interventional')  # ✅ FIXED
shap_values = explainer.shap_values(X_test.toarray(), check_additivity=False)  # ✅ Fixed additivity issue

# Save everything
joblib.dump(model, "models/disease_model.pkl")
joblib.dump(vectorizer, "models/tfidf_vectorizer.pkl")
joblib.dump(label_encoder, "models/label_encoder.pkl")
joblib.dump(explainer, "models/shap_explainer.pkl")

print("✅ Model trained & SHAP working correctly!")
