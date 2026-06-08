from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
from sklearn.linear_model import LinearRegression
import random

from data.food_data import DELICACIES, NIGHT_MARKETS, CATEGORIES, MEMORY_LINE, TRIVIA_QUESTIONS
from data.ml_data import ML_TOPICS

app = FastAPI(
    title="台灣夜市美食 & 機器學習學習平台 API",
    description="提供台灣50大美食、夜市資訊、ML主題學習與線性迴歸互動模型的 RESTful API",
    version="1.0.0"
)

# CORS middleware — allow Next.js frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# 食物 & 夜市 Routes
# ─────────────────────────────────────────────

@app.get("/api/food/delicacies", tags=["Food"])
def get_delicacies(
    category: Optional[str] = Query(None, description="篩選分類，例如: 主食, 小吃, 湯品, 甜點, 飲料"),
    region: Optional[str] = Query(None, description="篩選地區，例如: 北部, 中部, 南部, 全台"),
    search: Optional[str] = Query(None, description="搜尋食物名稱關鍵字"),
):
    """取得台灣50大美食列表，支援分類、地區與關鍵字篩選"""
    results = DELICACIES
    if category:
        results = [d for d in results if d["category"] == category]
    if region:
        results = [d for d in results if d["region"] == region or d["region"] == "全台"]
    if search:
        results = [d for d in results if search.lower() in d["name"].lower() or search.lower() in d["name_en"].lower()]
    return {"total": len(results), "data": results}


@app.get("/api/food/delicacies/{food_id}", tags=["Food"])
def get_delicacy_detail(food_id: int):
    """取得單一美食的詳細資訊"""
    food = next((d for d in DELICACIES if d["id"] == food_id), None)
    if not food:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"找不到 ID 為 {food_id} 的食物")
    return food


@app.get("/api/food/categories", tags=["Food"])
def get_categories():
    """取得所有食物分類"""
    category_counts = {}
    for d in DELICACIES:
        cat = d["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    return {
        "categories": CATEGORIES,
        "counts": category_counts
    }


@app.get("/api/food/nightmarkets", tags=["Night Markets"])
def get_night_markets(region: Optional[str] = Query(None, description="篩選地區")):
    """取得台灣知名夜市列表"""
    results = NIGHT_MARKETS
    if region:
        results = [nm for nm in results if nm["region"] == region]
    return {"total": len(results), "data": results}


@app.get("/api/food/nightmarkets/{market_id}", tags=["Night Markets"])
def get_night_market_detail(market_id: int):
    """取得單一夜市詳細資訊，包含該夜市的代表食物"""
    market = next((nm for nm in NIGHT_MARKETS if nm["id"] == market_id), None)
    if not market:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"找不到 ID 為 {market_id} 的夜市")
    
    # 取得在該夜市可找到的美食
    market_foods = [
        d for d in DELICACIES
        if market["name"] in d.get("night_markets", [])
    ]
    
    return {
        **market,
        "foods": market_foods,
        "food_count": len(market_foods)
    }


class MemoryComboRequest(BaseModel):
    main_food_id: Optional[int] = None      # 主食
    snack_food_id: Optional[int] = None     # 小吃
    soup_food_id: Optional[int] = None      # 湯品
    dessert_food_id: Optional[int] = None   # 甜點
    drink_food_id: Optional[int] = None     # 飲料


@app.post("/api/food/memory-combo", tags=["Food"])
def calculate_memory_combo(req: MemoryComboRequest):
    """
    計算使用者自選的記憶口訣組合（主食->小吃->湯品->甜點->飲料）的
    總卡路里、滿足感指數和組合評語
    """
    ids_map = {
        "主食": req.main_food_id,
        "小吃": req.snack_food_id,
        "湯品": req.soup_food_id,
        "甜點": req.dessert_food_id,
        "飲料": req.drink_food_id,
    }
    
    selected = []
    total_calories = 0
    total_satisfaction = 0.0
    count = 0
    
    for step, food_id in ids_map.items():
        if food_id:
            food = next((d for d in DELICACIES if d["id"] == food_id), None)
            if food:
                selected.append({"step": step, "food": food})
                total_calories += food.get("calories", 0)
                total_satisfaction += food.get("satisfaction", 0)
                count += 1
    
    avg_satisfaction = round(total_satisfaction / count, 2) if count > 0 else 0

    # 組合評語
    if avg_satisfaction >= 9.5:
        comment = "🏆 夢幻神組合！台灣夜市極致體驗！"
    elif avg_satisfaction >= 9.0:
        comment = "⭐ 絕佳組合！讓人回味無窮的夜市之旅！"
    elif avg_satisfaction >= 8.5:
        comment = "😋 不錯的組合！道地台灣風味！"
    else:
        comment = "👍 基本組合，可以試試其他搭配！"

    return {
        "selected": selected,
        "step_count": count,
        "total_calories": total_calories,
        "avg_satisfaction": avg_satisfaction,
        "comment": comment,
        "memory_line": MEMORY_LINE
    }


@app.get("/api/food/quiz", tags=["Quiz"])
def get_quiz(count: int = Query(5, ge=1, le=10, description="問題數量（1-10）")):
    """隨機取得台灣夜市美食知識問答題目"""
    questions = random.sample(TRIVIA_QUESTIONS, min(count, len(TRIVIA_QUESTIONS)))
    # 不直接回傳答案，前端確認後才提供
    safe_questions = [
        {
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
        }
        for q in questions
    ]
    return {"count": len(safe_questions), "questions": safe_questions}


@app.get("/api/food/quiz/answer/{question_id}", tags=["Quiz"])
def get_quiz_answer(question_id: int):
    """取得特定問題的答案與解析"""
    q = next((q for q in TRIVIA_QUESTIONS if q["id"] == question_id), None)
    if not q:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"找不到問題 ID {question_id}")
    return {
        "id": q["id"],
        "answer": q["answer"],
        "explanation": q["explanation"]
    }


# ─────────────────────────────────────────────
# 機器學習 Routes
# ─────────────────────────────────────────────

@app.get("/api/ml/topics", tags=["Machine Learning"])
def get_ml_topics():
    """取得十大機器學習主題列表"""
    return {"total": len(ML_TOPICS), "topics": ML_TOPICS}


@app.get("/api/ml/topics/{topic_id}", tags=["Machine Learning"])
def get_ml_topic_detail(topic_id: int):
    """取得單一機器學習主題的詳細資訊"""
    topic = next((t for t in ML_TOPICS if t["id"] == topic_id), None)
    if not topic:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"找不到主題 ID {topic_id}")
    return topic


class RegressionRequest(BaseModel):
    n: int = 200            # 資料點數量
    slope: float = 10.0    # 斜率 a
    intercept: float = 50.0  # 截距 b
    variance: float = 100.0  # 變異數
    num_outliers: int = 10  # 要標示的離群值數量


@app.post("/api/ml/regression", tags=["Machine Learning"])
def run_regression(req: RegressionRequest):
    """
    線性迴歸互動模擬器：
    根據使用者設定的參數（資料量、斜率、截距、變異數）生成雜訊資料，
    進行線性迴歸擬合，計算殘差，並回傳最大離群值的索引。
    """
    n = max(10, min(req.n, 1000))
    slope = max(-50.0, min(req.slope, 50.0))
    intercept = max(0.0, min(req.intercept, 100.0))
    variance = max(0.0, min(req.variance, 300.0))
    num_outliers = max(1, min(req.num_outliers, 20))

    np.random.seed(None)  # 每次都重新隨機
    
    # 生成資料
    x = np.random.uniform(-100, 100, n)
    std_dev = np.sqrt(variance)
    noise = np.random.normal(0, std_dev, n)
    y = slope * x + intercept + noise

    # 線性迴歸
    x_reshaped = x.reshape(-1, 1)
    model = LinearRegression()
    model.fit(x_reshaped, y)

    a_best = float(model.coef_[0])
    b_best = float(model.intercept_)

    # 計算殘差
    y_pred = model.predict(x_reshaped)
    residuals = np.abs(y - y_pred)

    # 找出最大的離群值
    actual_outliers = min(num_outliers, n)
    outlier_indices = np.argsort(residuals)[-actual_outliers:].tolist()

    # 迴歸線資料點（用於前端畫線）
    x_line = np.linspace(-100, 100, 100)
    y_line = a_best * x_line + b_best

    return {
        "true_params": {
            "slope": slope,
            "intercept": intercept,
            "variance": variance
        },
        "estimated_params": {
            "slope": round(a_best, 4),
            "intercept": round(b_best, 4)
        },
        "data_points": {
            "x": x.tolist(),
            "y": y.tolist(),
        },
        "regression_line": {
            "x": x_line.tolist(),
            "y": y_line.tolist()
        },
        "outlier_indices": outlier_indices,
        "n": n,
        "r_squared": round(float(model.score(x_reshaped, y)), 4)
    }


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "✅ API 運作正常",
        "name": "台灣夜市美食 & 機器學習學習平台 API",
        "version": "1.0.0",
        "docs": "/docs"
    }
