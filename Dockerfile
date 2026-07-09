FROM python:3.10-slim

WORKDIR /app

# Copy requirements.txt dari dalam folder backend ke kontainer
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh isi folder backend ke dalam kontainer
COPY backend/ .

# Hugging Face wajib pakai port 7860
EXPOSE 7860

# Jalankan alembic upgrade (jika perlu), jalankan seed.py, baru nyalakan uvicorn
CMD alembic upgrade head && python seed.py && uvicorn main:app --host 0.0.0.0 --port 7860
