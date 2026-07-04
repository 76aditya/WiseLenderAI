from pydantic import BaseModel
from typing import List

class Explanation(BaseModel):
    feature: str
    impact: float
    risk_impact: str
    description: str

class CreditRequest(BaseModel):

    # Financial

    loan_amnt: float
    annual_inc: float
    installment: float
    dti: float

    tot_cur_bal: float
    avg_cur_bal: float

    open_acc: int
    total_acc: int

    emp_length: float

    active_credit_ratio: float

    # Behavior

    revol_util: float
    bc_util: float
    credit_utilization_score: float
    home_ownership: str
    purpose: str
    verification_status: str

    # Digital Trust

    FLAG_MOBIL: int
    FLAG_PHONE: int
    FLAG_WORK_PHONE: int
    FLAG_CONT_MOBILE: int
    FLAG_EMAIL: int

    DAYS_EMPLOYED: int

    NAME_HOUSING_TYPE: str

    CNT_CHILDREN: int
    CNT_FAM_MEMBERS: int

    NAME_FAMILY_STATUS: str

    DAYS_REGISTRATION: int
    DAYS_ID_PUBLISH: int
    DAYS_LAST_PHONE_CHANGE: int

    REG_REGION_NOT_WORK_REGION: int
    REG_CITY_NOT_WORK_CITY: int
    LIVE_CITY_NOT_WORK_CITY: int

    NAME_EDUCATION_TYPE: str

    NAME_INCOME_TYPE: str

    OCCUPATION_TYPE: str

    ORGANIZATION_TYPE: str

    REGION_RATING_CLIENT: int

class CreditResponse(BaseModel):

    financial_index: float

    behavior_index: float

    digital_trust_index: float

    financial_probability: float

    behavior_probability: float

    digital_probability: float

    meta_index: float

    alternative_credit_score: int

    decision: str

    default_probability: float

    risk_level: str

    financial_reasons: List[Explanation]

    behavior_reasons: List[Explanation]

    digital_reasons: List[Explanation]