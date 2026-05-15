from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
NOTEBOOK_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v2.ipynb"


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
    "nutrition_reference = nutrition_indo[TARGET_COLUMNS].copy()",
    "MANUAL_NUTRITION_61_CLASSES",
    "total_macro_calories = (unified_nutrition['proteins'] * 4",
]:
    exec(cell_source_contains(marker), env)

unified_nutrition = env["unified_nutrition"]
mapping_df = env["mapping_df"]
target_food_classes = env["target_food_classes"]
OUTPUT_DIR = env["OUTPUT_DIR"]

if len(unified_nutrition) != 61:
    raise RuntimeError(f"Expected 61 nutrition rows, got {len(unified_nutrition)}")

if len(mapping_df) != 61:
    raise RuntimeError(f"Expected 61 mapping rows, got {len(mapping_df)}")

if set(mapping_df["status"]) != {"VERIFIED"}:
    raise RuntimeError("All mapping rows must be VERIFIED")

unified_nutrition.to_csv(OUTPUT_DIR / "processed" / "unified_nutrition.csv", index=False)
mapping_df.to_csv(OUTPUT_DIR / "processed" / "mapping_image_nutrition.csv", index=False)

import yaml

classes_yaml = {
    "path": "../datasets",
    "train": "images/train",
    "val": "images/val",
    "test": "images/test",
    "nc": len(target_food_classes),
    "names": target_food_classes,
}

with open(OUTPUT_DIR / "for_ai_engineer" / "classes.yaml", "w", encoding="utf-8") as file_handle:
    yaml.dump(classes_yaml, file_handle, default_flow_style=False, sort_keys=False)

print(f"unified_nutrition rows: {len(unified_nutrition)}")
print(f"mapping rows: {len(mapping_df)}")
print(f"classes.yaml classes: {len(target_food_classes)}")
print("source distribution:")
print(unified_nutrition["source"].value_counts().to_string())
