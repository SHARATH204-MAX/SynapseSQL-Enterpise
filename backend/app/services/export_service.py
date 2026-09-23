import io
import json
import pandas as pd
from typing import List, Dict, Any

class ExportService:
    @staticmethod
    def to_csv(columns: List[str], rows: List[List[Any]]) -> str:
        df = pd.DataFrame(rows, columns=columns)
        return df.to_csv(index=False)

    @staticmethod
    def to_excel(columns: List[str], rows: List[List[Any]]) -> bytes:
        df = pd.DataFrame(rows, columns=columns)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='QueryResults')
        return output.getvalue()

    @staticmethod
    def to_json(columns: List[str], rows: List[List[Any]]) -> str:
        df = pd.DataFrame(rows, columns=columns)
        return df.to_json(orient='records', indent=2)
