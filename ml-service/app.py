from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

# Try to import prophet, fallback if not installed
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("⚠️ Prophet not installed. Install with: pip install prophet")

app = FastAPI(title="SCIMS ML Service", description="AI Forecasting Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class TransactionData(BaseModel):
    item_id: int
    item_name: str
    transactions: List[dict]

class ForecastRequest(BaseModel):
    items: List[TransactionData]
    days: int = 30

@app.get("/")
async def root():
    return {
        "message": "SCIMS ML Service is running",
        "status": "active",
        "prophet_available": PROPHET_AVAILABLE
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "prophet_available": PROPHET_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/forecast")
async def forecast(request: ForecastRequest):
    """
    Generate demand forecast using Prophet
    """
    try:
        if not PROPHET_AVAILABLE:
            return {
                "success": False,
                "message": "Prophet library is not installed. Install with: pip install prophet",
                "data": []
            }

        results = []
        
        for item in request.items:
            if not item.transactions or len(item.transactions) < 7:
                results.append({
                    "item_id": item.item_id,
                    "item_name": item.item_name,
                    "forecast": [],
                    "confidence": 0,
                    "recommendation": "Insufficient historical data for AI forecasting. Need at least 7 days of data.",
                    "trend": "unknown",
                    "avg_daily_usage": 0,
                    "predicted_daily_usage": 0
                })
                continue
            
            # Prepare data for Prophet
            df = pd.DataFrame(item.transactions)
            df['ds'] = pd.to_datetime(df['date'])
            df['y'] = df['quantity']
            df = df[['ds', 'y']]
            
            # Create and fit model
            model = Prophet(
                yearly_seasonality=False,
                weekly_seasonality=True,
                daily_seasonality=False,
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
            )
            
            model.fit(df)
            
            # Make future predictions
            future = model.make_future_dataframe(periods=request.days)
            forecast_result = model.predict(future)
            
            # Extract forecast
            forecast_data = []
            for i, row in forecast_result.tail(request.days).iterrows():
                forecast_data.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "predicted": round(max(row['yhat'], 0), 2),
                    "lower": round(max(row['yhat_lower'], 0), 2),
                    "upper": round(max(row['yhat_upper'], 0), 2)
                })
            
            # Calculate confidence
            mape = np.mean(np.abs((df['y'] - forecast_result['yhat'][:len(df)]) / df['y'])) if len(df) > 0 and (df['y'] > 0).all() else 0.5
            confidence = max(0, min(1, 1 - mape))
            
            # Generate recommendation
            avg_daily_usage = df['y'].mean() if len(df) > 0 else 0
            latest_forecast = forecast_data[-1]['predicted'] if forecast_data else 0
            
            if latest_forecast > avg_daily_usage * 1.3:
                recommendation = "📈 Increasing demand expected. Consider increasing stock levels."
                trend = "increasing"
            elif latest_forecast < avg_daily_usage * 0.7:
                recommendation = "📉 Decreasing demand expected. Consider reducing stock levels."
                trend = "decreasing"
            else:
                recommendation = "📊 Stable demand expected. Maintain current stock levels."
                trend = "stable"
            
            results.append({
                "item_id": item.item_id,
                "item_name": item.item_name,
                "forecast": forecast_data,
                "confidence": round(confidence * 100, 2),
                "recommendation": recommendation,
                "trend": trend,
                "avg_daily_usage": round(avg_daily_usage, 2),
                "predicted_daily_usage": round(latest_forecast, 2)
            })
        
        return {"success": True, "data": results}
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "data": []
        }

@app.post("/seasonal")
async def detect_seasonal(request: ForecastRequest):
    """
    Detect seasonal patterns using Prophet
    """
    try:
        if not PROPHET_AVAILABLE:
            return {
                "success": False,
                "message": "Prophet library is not installed.",
                "data": []
            }

        results = []
        
        for item in request.items:
            if not item.transactions or len(item.transactions) < 7:
                results.append({
                    "item_id": item.item_id,
                    "item_name": item.item_name,
                    "seasonal_patterns": [],
                    "yearly_seasonality": "insufficient_data",
                    "peak_months": [],
                    "low_months": [],
                    "recommendation": "Add more historical data for seasonal analysis."
                })
                continue
            
            # Prepare data for Prophet
            df = pd.DataFrame(item.transactions)
            df['ds'] = pd.to_datetime(df['date'])
            df['y'] = df['quantity']
            df = df[['ds', 'y']]
            
            # Create model with yearly seasonality
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                seasonality_mode='multiplicative',
                seasonality_prior_scale=10.0,
            )
            
            model.fit(df)
            
            # Get seasonal components
            future = model.make_future_dataframe(periods=365)
            forecast = model.predict(future)
            
            # Identify peak and low months
            monthly_avg = {}
            for i, row in forecast.iterrows():
                month = row['ds'].month
                if month not in monthly_avg:
                    monthly_avg[month] = []
                monthly_avg[month].append(row['yearly'])
            
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            peak_months = []
            low_months = []
            
            for month, values in monthly_avg.items():
                avg = np.mean(values)
                monthly_avg[month] = avg
            
            sorted_months = sorted(monthly_avg.items(), key=lambda x: x[1], reverse=True)
            
            if len(sorted_months) >= 3:
                peak_months = [month_names[m[0]-1] for m in sorted_months[:3]]
                low_months = [month_names[m[0]-1] for m in sorted_months[-3:]]
            
            # Determine seasonality strength
            values = list(monthly_avg.values())
            if len(values) > 1:
                max_val = max(values)
                min_val = min(values)
                if max_val > 0 and min_val > 0:
                    ratio = max_val / min_val
                    if ratio > 2.0:
                        seasonality_strength = "strong"
                    elif ratio > 1.3:
                        seasonality_strength = "moderate"
                    else:
                        seasonality_strength = "weak"
                else:
                    seasonality_strength = "weak"
            else:
                seasonality_strength = "insufficient_data"
            
            # Generate recommendation
            if seasonality_strength == "strong":
                recommendation = f"📊 Strong seasonal pattern detected. Plan inventory for peak months: {', '.join(peak_months)}."
            elif seasonality_strength == "moderate":
                recommendation = f"📊 Moderate seasonal pattern detected. Consider adjusting stock for {', '.join(peak_months)}."
            else:
                recommendation = "📊 Weak or no seasonal pattern detected. Demand is relatively stable year-round."
            
            results.append({
                "item_id": item.item_id,
                "item_name": item.item_name,
                "seasonal_strength": seasonality_strength,
                "peak_months": peak_months,
                "low_months": low_months,
                "recommendation": recommendation,
                "monthly_averages": {month_names[i-1]: round(monthly_avg.get(i, 0), 2) for i in range(1, 13)}
            })
        
        return {"success": True, "data": results}
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "data": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


