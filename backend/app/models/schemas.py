from pydantic import BaseModel, Field
from typing import List, Optional, Any
from uuid import UUID

# Schemes (from Database)
class SchemeBase(BaseModel):
    name: str
    category: str
    eligible_occupations: List[str]
    income_limit: Optional[int] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    states: List[str]
    documents: List[str]
    benefit_summary: str
    apply_steps: List[str]
    target_groups: Optional[List[str]] = []
    scheme_type: str

class Scheme(SchemeBase):
    id: UUID

# API Requests
class FullAnalysisRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    state_hint: Optional[str] = None

class StoreQueryRequest(BaseModel):
    query_text: str
    detected_occupation: Optional[str] = None
    detected_income: Optional[int] = None
    detected_state: Optional[str] = None
    detected_age: Optional[int] = None

# API Responses
class ProfileData(BaseModel):
    occupation: Optional[str] = None
    income: Optional[Any] = None
    state: Optional[str] = None
    age: Optional[Any] = None
    gender: Optional[str] = None
    category: Optional[str] = None

from pydantic import BaseModel, root_validator
class SchemeMatch(BaseModel):
    name: str
    score: int
    confidence: str
    eligibilityScore: str = "low"
    reason: str
    simple_reason: str
    documents: List[str]
    benefit: str
    steps: List[str]
    matched_factors: List[str]
    target_groups: Optional[List[str]] = []
    estimated_value: Optional[str] = None
    official_url: Optional[str] = None
    sample_form_url: Optional[str] = None
    recommendation_level: str = "primary"

    @root_validator(pre=True)
    def trim_strings(cls, values):
        for k, v in values.items():
            if isinstance(v, str):
                values[k] = v.strip().replace('\r\n', '\n')
        return values


class FullAnalysisResponse(BaseModel):
    profile: ProfileData
    profile_summary: str
    schemes: List[SchemeMatch]
    benefits_summary: str
    speakable_text: str
    processing_time_ms: Optional[int] = None
    data_source: Optional[str] = "Government scheme database and eligibility engine"
    follow_up_question: Optional[str] = None

class DemoResponse(FullAnalysisResponse):
    pass
