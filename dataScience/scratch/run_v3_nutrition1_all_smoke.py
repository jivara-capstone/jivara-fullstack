from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
NOTEBOOK_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v3.ipynb"


nb = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))


def cell_source_contains(pattern):
    for cell in nb["cells"]:
        source = "".join(cell.get("source", []))
        if cell.get("cell_type") == "code" and pattern in source:
            return source
    raise RuntimeError(f"Cell not found: {pattern}")


env = {"__name__": "__main__"}

for marker in [
    "import pandas as pd",
    "nutrition_indo_raw = pd.read_csv",
    "nutrition_indo = nutrition_indo_raw.copy()",
    "nutrition_catalog_df = unified_nutrition",
    "required_numeric_cols = ['calories'",
    "total_macro_calories = (unified_nutrition['proteins'] * 4",
]:
    exec(cell_source_contains(marker), env)

unified_nutrition = env["unified_nutrition"]
nutrition_catalog_df = env["nutrition_catalog_df"]
OUTPUT_DIR = env["OUTPUT_DIR"]

if len(unified_nutrition) != 1346:
    raise RuntimeError(f"Expected 1346 nutrition rows, got {len(unified_nutrition)}")

if len(nutrition_catalog_df) != len(unified_nutrition):
    raise RuntimeError("Catalog row count must match unified nutrition row count")

if unified_nutrition["nutrition_key"].duplicated().sum() != 0:
    raise RuntimeError("nutrition_key must be unique in v3 output")

unified_nutrition.to_csv(OUTPUT_DIR / "processed" / "unified_nutrition_all_nutrition1.csv", index=False)
nutrition_catalog_df.to_csv(OUTPUT_DIR / "processed" / "nutrition1_food_catalog.csv", index=False)

print(f"unified_nutrition_all_nutrition1 rows: {len(unified_nutrition)}")
print(f"nutrition1_food_catalog rows: {len(nutrition_catalog_df)}")
print("macro category distribution:")
print(unified_nutrition["macro_category"].value_counts().to_string())
