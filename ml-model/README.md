# WiseLenderAI - ML Model Service

## Overview

WiseLenderAI ML Model Service is a standalone REST API responsible for generating an **Alternative Credit Score** and predicting the **probability of loan default** using multiple machine learning models.

Unlike traditional credit scoring systems that rely only on historical credit bureau records, this service evaluates an applicant from three independent perspectives:

* **Financial Intelligence**
* **Behavioral Intelligence**
* **Digital Trust Intelligence**

The outputs from these models are combined using a weighted ensemble to generate a final lending decision.

---

# Model Architecture

```
                          Client
                            │
                            ▼
                     FastAPI REST API
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼

 Financial Model      Behavioral Model    Digital Trust Model
    (XGBoost)             (XGBoost)           (CatBoost)

         └──────────────────┼──────────────────┘
                            │
                            ▼
                  Meta Ensemble Calculator
                            │
                            ▼
        Alternative Credit Score (300-850)
                            │
                            ▼
                  Default Probability
                            │
                            ▼
                       Risk Level
                            │
                            ▼
              SHAP Explainable AI Results
```

---

# Models

## 1. Financial Intelligence Model

Algorithm

```
XGBoost Classifier
```

Purpose

Evaluates the applicant's financial capability using credit history, income, liabilities and repayment capacity.

Produces

* Financial Index
* Financial Default Probability
* SHAP Feature Importance

---

## 2. Behavioral Intelligence Model

Algorithm

```
XGBoost Classifier
```

Purpose

Evaluates historical borrowing behaviour and repayment habits.

Produces

* Behavioral Index
* Behavioral Default Probability
* SHAP Feature Importance

---

## 3. Digital Trust Intelligence Model

Algorithm

```
CatBoost Classifier
```

Purpose

Evaluates alternative trust indicators derived from applicant profile information.

Produces

* Digital Trust Index
* Digital Default Probability
* SHAP Feature Importance

---

## 4. Meta Ensemble

The outputs from all three models are combined to generate

* Meta Index
* Alternative Credit Score
* Final Default Probability
* Final Risk Level

---

# Technology Stack

| Component           | Technology   |
| ------------------- | ------------ |
| Language            | Python 3.12  |
| API                 | FastAPI      |
| Financial Model     | XGBoost      |
| Behavioral Model    | XGBoost      |
| Digital Trust Model | CatBoost     |
| Explainability      | SHAP         |
| ML Utilities        | Scikit-Learn |
| Data Processing     | Pandas       |
| Serialization       | Joblib       |
| Validation          | Pydantic     |
| API Server          | Uvicorn      |

---

# Project Structure

```
ml-model/
│
├── api/
│   ├── main.py
│   ├── predictor.py
│   ├── schemas.py
│   ├── ensemble.py
│   ├── explanations.py
│   ├── financial_model.py
│   ├── behavioral_model.py
│   └── digital_trust_model.py
│
├── models/
│   ├── financial_model.pkl
│   ├── behavior_model.pkl
│   ├── digital_trust_model.pkl
│   ├── financial_features.pkl
│   ├── behavior_features.pkl
│   ├── digital_features.pkl
│   ├── financial_threshold.pkl
│   ├── behavior_threshold.pkl
│   ├── digital_threshold.pkl
│   ├── financial_shap.pkl
│   ├── behavior_shap.pkl
│   ├── digital_trust_shap.pkl
│   ├── behavior_maps.pkl
│   └── digital_maps.pkl
│
├── notebooks/
│   ├── financial_model.ipynb
│   ├── behavioral_model.ipynb
│   ├── digital_trust_model.ipynb
│   └── ensemble_model.ipynb
│
├── requirements.txt
└── README.md
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
cd WiseLenderAI/ml-model
```

Create virtual environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# Required Model Files

The following files must exist inside the **models/** directory before starting the API.

```
financial_model.pkl
behavior_model.pkl
digital_trust_model.pkl

financial_features.pkl
behavior_features.pkl
digital_features.pkl

financial_threshold.pkl
behavior_threshold.pkl
digital_threshold.pkl

financial_shap.pkl
behavior_shap.pkl
digital_trust_shap.pkl

behavior_maps.pkl
digital_maps.pkl
```

These files are automatically generated after training the respective notebooks.

---

# Running the API

Move into the API directory

```bash
cd api
```

Run

```bash
uvicorn main:app --reload
```

Server URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Health Check

Endpoint

```
GET /
```

Example Response

```json
{
    "status":"running"
}
```

---

# API Endpoint

```
POST /predict
```

Consumes

```
application/json
```

Produces

```
application/json
```

---

# API Outputs

The API returns

* Financial Index
* Behavioral Index
* Digital Trust Index
* Meta Index
* Alternative Credit Score
* Financial Default Probability
* Behavioral Default Probability
* Digital Default Probability
* Overall Default Probability
* Risk Level
* Financial SHAP Explanations
* Behavioral SHAP Explanations
* Digital Trust SHAP Explanations

```
```
# API Input Documentation

The `/predict` endpoint accepts a single JSON object containing applicant financial, behavioral, and digital profile information.

## Request Format

```json
`{
  "loan_amnt": 10000,
  "annual_inc": 50000,
  "installment": 320,
  "dti": 15,
  "tot_cur_bal": 18000,
  "avg_cur_bal": 4500,
  "open_acc": 8,
  "total_acc": 20,
  "emp_length": 5,
  "revol_util": 35,
  "bc_util": 40,
  "home_ownership": "RENT",
  "purpose": "debt_consolidation",
  "verification_status": "Verified",

  "FLAG_MOBIL": 1,
  "FLAG_PHONE": 1,
  "FLAG_WORK_PHONE": 1,
  "FLAG_CONT_MOBILE": 1,
  "FLAG_EMAIL": 1,
  "DAYS_EMPLOYED": -2400,
  "FLAG_OWN_REALTY": "Y",
  "NAME_HOUSING_TYPE": "House / apartment",
  "CNT_CHILDREN": 1,
  "CNT_FAM_MEMBERS": 3,
  "NAME_FAMILY_STATUS": "Married",
  "DAYS_REGISTRATION": -4500,
  "DAYS_ID_PUBLISH": -2200,
  "DAYS_LAST_PHONE_CHANGE": -350,
  "REG_REGION_NOT_WORK_REGION": 0,
  "REG_CITY_NOT_WORK_CITY": 0,
  "LIVE_CITY_NOT_WORK_CITY": 0,
  "NAME_EDUCATION_TYPE": "Higher education",
  "NAME_INCOME_TYPE": "Working",
  "OCCUPATION_TYPE": "Laborers",
  "ORGANIZATION_TYPE": "Business Entity Type 3",
  "REGION_RATING_CLIENT": 2
}
```

---

# Financial Model Features

| Field               | Type    | Required | Description                                | Example            |
| ------------------- | ------- | -------- | ------------------------------------------ | ------------------ |
| loan_amnt           | float   | Yes      | Loan amount requested by applicant         | 10000              |
| annual_inc          | float   | Yes      | Annual income before taxes                 | 50000              |
| installment         | float   | Yes      | Monthly EMI amount                         | 325                |
| dti                 | float   | Yes      | Debt-to-income ratio (%)                   | 18.5               |
| tot_cur_bal         | float   | Yes      | Total outstanding credit balance           | 25000              |
| avg_cur_bal         | float   | Yes      | Average balance across active accounts     | 5200               |
| open_acc            | integer | Yes      | Number of currently active credit accounts | 8                  |
| total_acc           | integer | Yes      | Total number of credit accounts            | 20                 |
| emp_length          | integer | Yes      | Employment duration in years               | 6                  |
| revol_util          | float   | Yes      | Revolving credit utilization (%)           | 42                 |
| bc_util             | float   | Yes      | Bankcard utilization (%)                   | 38                 |
| home_ownership      | string  | Yes      | Applicant housing status                   | RENT               |
| purpose             | string  | Yes      | Reason for requesting loan                 | debt_consolidation |
| verification_status | string  | Yes      | Income verification status                 | Verified           |

---

# Financial Feature Descriptions

## loan_amnt

Requested loan amount.

Higher values generally indicate larger repayment responsibility.

Expected Type

```text
float
```

---

## annual_inc

Total yearly income before taxes.

Higher income generally improves repayment capability.

Expected Type

```text
float
```

---

## installment

Expected monthly repayment amount.

Higher installments increase repayment burden.

Expected Type

```text
float
```

---

## dti

Debt-to-Income Ratio.

Formula

```text
Monthly Debt / Monthly Income × 100
```

Lower values indicate healthier finances.

Expected Type

```text
float
```

Range

```text
0 - 100
```

---

## tot_cur_bal

Combined outstanding balance across all active accounts.

Expected Type

```text
float
```

---

## avg_cur_bal

Average balance maintained per active account.

Expected Type

```text
float
```

---

## open_acc

Number of currently active credit accounts.

Expected Type

```text
integer
```

---

## total_acc

Total number of credit accounts ever opened.

Expected Type

```text
integer
```

Must satisfy

```text
total_acc >= open_acc
```

---

## emp_length

Years of employment.

Longer employment generally indicates greater financial stability.

Expected Type

```text
integer
```

---

## revol_util

Percentage of revolving credit currently utilized.

Lower utilization generally indicates healthier credit behavior.

Expected Type

```text
float
```

Range

```text
0 -100
```

---

## bc_util

Percentage utilization of bankcard credit.

Lower values are generally preferred.

Expected Type

```text
float
```

Range

```text
0-100
```

---

# Behavioral Model Inputs

The Behavioral Model uses the following user-provided fields to internally generate behavioral scores.

| Field               | Type   | Description                      |
| ------------------- | ------ | -------------------------------- |
| revol_util          | float  | Revolving utilization percentage |
| bc_util             | float  | Bankcard utilization percentage  |
| home_ownership      | string | Housing ownership status         |
| purpose             | string | Loan purpose                     |
| verification_status | string | Income verification status       |

Internally generated features

```text
credit_utilization_score
housing_stability_score
purpose_risk_score
verification_score
```

These scores are generated automatically inside the ML service.

---

# Digital Trust Model Inputs

The Digital Trust model uses applicant demographic and profile information.

| Field                      | Type    | Description                    |
| -------------------------- | ------- | ------------------------------ |
| FLAG_MOBIL                 | integer | Mobile number available        |
| FLAG_PHONE                 | integer | Phone number available         |
| FLAG_WORK_PHONE            | integer | Work phone available           |
| FLAG_CONT_MOBILE           | integer | Continuous mobile availability |
| FLAG_EMAIL                 | integer | Email available                |
| DAYS_EMPLOYED              | integer | Employment duration in dataset |
| FLAG_OWN_REALTY            | string  | Owns real estate               |
| NAME_HOUSING_TYPE          | string  | Housing type                   |
| CNT_CHILDREN               | integer | Number of children             |
| CNT_FAM_MEMBERS            | integer | Family members                 |
| NAME_FAMILY_STATUS         | string  | Marital status                 |
| DAYS_REGISTRATION          | integer | Registration duration          |
| DAYS_ID_PUBLISH            | integer | Days since ID updated          |
| DAYS_LAST_PHONE_CHANGE     | integer | Days since phone changed       |
| REG_REGION_NOT_WORK_REGION | integer | Region mismatch flag           |
| REG_CITY_NOT_WORK_CITY     | integer | City mismatch flag             |
| LIVE_CITY_NOT_WORK_CITY    | integer | Live/work city mismatch        |
| NAME_EDUCATION_TYPE        | string  | Education level                |
| NAME_INCOME_TYPE           | string  | Income source                  |
| OCCUPATION_TYPE            | string  | Occupation                     |
| ORGANIZATION_TYPE          | string  | Employer type                  |
| REGION_RATING_CLIENT       | integer | Region quality rating          |

Internally generated

```text
communication_score
employment_stability_score
housing_stability_score
family_stability_score
identity_consistency_score
regional_stability_score
education_stability_score
income_stability_score
occupation_stability_score
organization_stability_score
regional_quality_score
```

These values are computed automatically by the API before prediction.

---

# Backend Notes

* Send data as JSON.
* Numeric values must be sent as numbers.
* Strings are case-sensitive.
* Do not send engineered scores.
* The API generates engineered scores internally.
* Missing required fields will return HTTP 422.

---

# Frontend Recommendations

| Field Type  | Recommended UI        |
| ----------- | --------------------- |
| float       | Number Input          |
| integer     | Number Input          |
| percentage  | Slider + Number Input |
| categorical | Dropdown              |
| binary      | Toggle / Radio Button |
| yes/no      | Dropdown              |

Frontend validation should ensure

* Percentages remain between 0–100.
* Integers cannot be negative unless explicitly required (such as `DAYS_*` fields from the Home Credit dataset).
* Dropdown values exactly match the allowed categorical values documented in the next section.

 # Allowed Categorical Values

The following fields accept only the specified values. These values are **case-sensitive** and must exactly match the values shown below.

---

# home_ownership

Represents the applicant's current housing status.

| Value    | Meaning                                 |
| -------- | --------------------------------------- |
| RENT     | Applicant lives in rented accommodation |
| OWN      | Applicant owns the house/property       |
| MORTGAGE | House is financed through a mortgage    |
| OTHER    | Any other housing arrangement           |

Frontend

* Dropdown

Backend

* Reject values outside the above list.

---

# purpose

Reason for requesting the loan.

| Value              | Meaning                                       |
| ------------------ | --------------------------------------------- |
| debt_consolidation | Consolidate multiple debts                    |
| credit_card        | Repay credit card debt                        |
| home_improvement   | Home renovation or repairs                    |
| house              | Purchase of a house                           |
| car                | Vehicle purchase                              |
| major_purchase     | Large purchase (electronics, furniture, etc.) |
| medical            | Medical expenses                              |
| moving             | Relocation expenses                           |
| vacation           | Travel expenses                               |
| wedding            | Marriage expenses                             |
| small_business     | Business funding                              |
| educational        | Education expenses                            |
| renewable_energy   | Solar panels, green energy, etc.              |
| other              | Any other personal purpose                    |

Frontend

Dropdown

---

# verification_status

Indicates whether the applicant's income has been verified.

| Value           | Meaning                                |
| --------------- | -------------------------------------- |
| Verified        | Income officially verified             |
| Source Verified | Verified using trusted external source |
| Not Verified    | Income not verified                    |

Higher verification generally improves lender confidence.

Frontend

Dropdown

---

# FLAG_OWN_REALTY

Whether the applicant owns real estate.

| Value | Meaning               |
| ----- | --------------------- |
| Y     | Owns property         |
| N     | Does not own property |

Frontend

Radio Button or Dropdown

---

# NAME_HOUSING_TYPE

Current residential arrangement.

| Value               | Meaning                                |
| ------------------- | -------------------------------------- |
| House / apartment   | Lives in own/rented house or apartment |
| With parents        | Lives with parents                     |
| Municipal apartment | Government-provided accommodation      |
| Rented apartment    | Private rented apartment               |
| Office apartment    | Employer-provided residence            |
| Co-op apartment     | Cooperative housing                    |

Frontend

Dropdown

---

# NAME_FAMILY_STATUS

Applicant's marital status.

| Value                | Meaning                                 |
| -------------------- | --------------------------------------- |
| Married              | Legally married                         |
| Single / not married | Never married                           |
| Civil marriage       | Living together without formal marriage |
| Separated            | Legally separated                       |
| Widow                | Spouse deceased                         |
| Unknown              | Unknown marital status                  |

Frontend

Dropdown

---

# NAME_EDUCATION_TYPE

Highest completed education.

| Value                         | Meaning                      |
| ----------------------------- | ---------------------------- |
| Academic degree               | Doctorate / Research Degree  |
| Higher education              | Bachelor's / Master's Degree |
| Incomplete higher             | College not completed        |
| Secondary / secondary special | High School                  |
| Lower secondary               | Middle School                |
| Lower than secondary          | Primary School or below      |

Frontend

Dropdown

---

# NAME_INCOME_TYPE

Primary source of income.

| Value                | Meaning                        |
| -------------------- | ------------------------------ |
| Working              | Salaried employee              |
| Commercial associate | Business owner / Self-employed |
| Pensioner            | Pension income                 |
| State servant        | Government employee            |
| Student              | Student                        |
| Unemployed           | No employment                  |
| Maternity leave      | Receiving maternity benefits   |
| Businessman          | Business owner                 |
| Current employer     | Employer-sponsored income      |

Frontend

Dropdown

---

# OCCUPATION_TYPE

Current occupation.

| Value                 | Meaning                       |
| --------------------- | ----------------------------- |
| Laborers              | Manual labor                  |
| Core staff            | Office professionals          |
| Managers              | Management positions          |
| Sales staff           | Sales employees               |
| Drivers               | Professional drivers          |
| High skill tech staff | Engineers / Technical experts |
| Accountants           | Accounting professionals      |
| Medicine staff        | Healthcare workers            |
| Security staff        | Security personnel            |
| Cooking staff         | Food service employees        |
| Cleaning staff        | Cleaning personnel            |
| Secretaries           | Administrative assistants     |
| Private service staff | Domestic/private services     |
| HR staff              | Human Resources               |
| IT staff              | Information Technology        |
| Realty agents         | Property dealers              |
| Low-skill Laborers    | Entry-level manual workers    |
| Waiters/barmen staff  | Hospitality staff             |
| High skill managers   | Senior executives             |
| Unknown               | Occupation unavailable        |

Frontend

Dropdown with search

---

# ORGANIZATION_TYPE

Employer category.

| Value                  | Meaning                      |
| ---------------------- | ---------------------------- |
| Business Entity Type 1 | Private Company Type 1       |
| Business Entity Type 2 | Private Company Type 2       |
| Business Entity Type 3 | Private Company Type 3       |
| Self-employed          | Own business                 |
| Government             | Government organization      |
| School                 | Educational institution      |
| University             | Higher education institution |
| Bank                   | Banking sector               |
| Insurance              | Insurance company            |
| Medicine               | Healthcare organization      |
| Trade                  | Trading company              |
| Industry               | Manufacturing industry       |
| Construction           | Construction company         |
| Transport              | Transportation sector        |
| Agriculture            | Agricultural sector          |
| Hotel                  | Hospitality industry         |
| Restaurant             | Food service                 |
| Electricity            | Power sector                 |
| Telecom                | Telecommunications           |
| Police                 | Police department            |
| Military               | Armed forces                 |
| Emergency              | Emergency services           |
| Postal                 | Postal department            |
| Security               | Security services            |
| Advertising            | Marketing agency             |
| Cleaning               | Cleaning services            |
| Culture                | Arts & Culture               |
| Religion               | Religious organization       |
| Housing                | Housing authority            |
| Mobile                 | Mobile operator              |
| Other                  | Other organization           |

Frontend

Searchable Dropdown

---

# REGION_RATING_CLIENT

Represents the overall economic and infrastructure quality of the applicant's region.

| Value | Meaning                            |
| ----- | ---------------------------------- |
| 1     | Best region (lowest regional risk) |
| 2     | Average region                     |
| 3     | High-risk region                   |

Lower values generally indicate better regional development.

Frontend

Dropdown

---

# Binary Flags

These fields accept only **0** or **1**.

| Field                      | 0                             | 1                           |
| -------------------------- | ----------------------------- | --------------------------- |
| FLAG_MOBIL                 | Mobile not available          | Mobile available            |
| FLAG_PHONE                 | Phone unavailable             | Phone available             |
| FLAG_WORK_PHONE            | Work phone unavailable        | Work phone available        |
| FLAG_CONT_MOBILE           | Mobile continuity unavailable | Mobile continuity available |
| FLAG_EMAIL                 | Email unavailable             | Email available             |
| REG_REGION_NOT_WORK_REGION | Same region                   | Different region            |
| REG_CITY_NOT_WORK_CITY     | Same city                     | Different city              |
| LIVE_CITY_NOT_WORK_CITY    | Same city                     | Different city              |

Frontend

Switch / Toggle / Radio Button

Backend

Accept only integer values **0** or **1**.

---

# Numeric Fields

| Field                  | Type    | Unit             |
| ---------------------- | ------- | ---------------- |
| loan_amnt              | float   | Currency         |
| annual_inc             | float   | Currency / Year  |
| installment            | float   | Currency / Month |
| dti                    | float   | Percentage       |
| revol_util             | float   | Percentage       |
| bc_util                | float   | Percentage       |
| tot_cur_bal            | float   | Currency         |
| avg_cur_bal            | float   | Currency         |
| open_acc               | integer | Count            |
| total_acc              | integer | Count            |
| emp_length             | integer | Years            |
| CNT_CHILDREN           | integer | Count            |
| CNT_FAM_MEMBERS        | integer | Count            |
| DAYS_EMPLOYED          | integer | Days             |
| DAYS_REGISTRATION      | integer | Days             |
| DAYS_ID_PUBLISH        | integer | Days             |
| DAYS_LAST_PHONE_CHANGE | integer | Days             |

---

# Developer Notes

## Backend

* Validate categorical values exactly as documented.
* Reject unknown categories with **HTTP 422**.
* Do **not** expect engineered features (`verification_score`, `communication_score`, etc.) in the request. These are generated internally by the ML service.
* Numeric fields should be sent as JSON numbers (`int` or `float`).

## Frontend

* Use dropdowns for all categorical fields.
* Use number inputs for numeric fields.
* Use sliders for percentage fields (`dti`, `revol_util`, `bc_util`) if desired.
* Binary flags (`0`/`1`) can be represented as switches, radio buttons, or yes/no dropdowns.
* Ensure the values sent to the API exactly match the allowed strings listed above, including capitalization and spacing.
