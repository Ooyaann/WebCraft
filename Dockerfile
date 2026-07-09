FROM python:3.10-slim

WORKDIR /app

# Copy requirements.txt dari dalam folder backend ke kontainer
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh isi folder backend ke dalam kontainer
COPY backend/ .

# Hugging Face wajib pakai port 7860
EXPOSE 7860

# Jalankan script seed.py untuk membersihkan & memuat data baru, lalu nyalakan Uvicorn
CMD python seed.py && uvicorn main:app --host 0.0.0.0 --port 7860