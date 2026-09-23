from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Any
from app.services.export_service import ExportService

router = APIRouter()

class ExportRequest(BaseModel):
    columns: List[str]
    rows: List[List[Any]]
    filename: str = "query_results"

@router.post("/csv")
def export_csv(req: ExportRequest):
    try:
        csv_str = ExportService.to_csv(req.columns, req.rows)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={req.filename}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/excel")
def export_excel(req: ExportRequest):
    try:
        excel_bytes = ExportService.to_excel(req.columns, req.rows)
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={req.filename}.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/json")
def export_json(req: ExportRequest):
    try:
        json_str = ExportService.to_json(req.columns, req.rows)
        return Response(
            content=json_str,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={req.filename}.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
