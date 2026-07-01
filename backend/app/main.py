from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os
from typing import Optional
from datetime import datetime
from .ml_services import get_smart_crop_box

from . import models
from .database import engine, get_db
from .schemas import UserCreate, UserOut, ForgotPasswordRequest, ResetPasswordRequest, PhotoOut

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Photo Editor API")

from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    new_user = models.User(username=user.username, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"user_id": user.id, "username": user.username}

@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    reset_token = "fake-reset-token-123"
    print(f"Reset token for {req.email}: {reset_token}")
    return {"message": "Reset token generated", "token": reset_token}

@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password = req.new_password
    db.commit()
    return {"message": "Password updated successfully"}

@app.post("/upload", response_model=PhotoOut)
async def upload_photo(
    user_id: int, 
    photo_id: Optional[int] = None,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if photo_id:
        photo = db.query(models.Photo).filter(models.Photo.id == photo_id, models.Photo.user_id == user_id).first()
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        relative_path = photo.filepath.lstrip("/")
        file_location = os.path.join(os.path.dirname(__file__), "..", relative_path)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        photo.changed_at = datetime.utcnow()
        db.commit()
        db.refresh(photo)
        return photo

    else:
        timestamp = int(datetime.utcnow().timestamp())
        unique_name = f"{user_id}_{timestamp}_{file.filename}"
        file_location = os.path.join(UPLOAD_DIR, unique_name)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            relative_path = f"/static/uploads/{unique_name}"
        photo = models.Photo(filepath=relative_path, user_id=user.id)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo

@app.get("/photos/{photo_id}/download")
async def download_photo(photo_id: int, user_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo or photo.user_id != user_id:
        raise HTTPException(status_code=404, detail="Photo not found")

    relative_path = photo.filepath.lstrip("/")
    absolute_path = os.path.join(os.path.dirname(__file__), "..", relative_path)

    if not os.path.exists(absolute_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    original_filename = os.path.basename(photo.filepath)

    return FileResponse(
        absolute_path,
        media_type="application/octet-stream",
        filename=original_filename
    )

@app.get("/gallery/{user_id}", response_model=list[PhotoOut])
def get_gallery(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    photos = db.query(models.Photo)\
               .filter(models.Photo.user_id == user_id)\
               .order_by(models.Photo.changed_at.desc())\
               .all()
               
    return photos

@app.get("/photos/{photo_id}/smart-crop")
async def smart_crop_photo(photo_id: int, user_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo or photo.user_id != user_id:
        raise HTTPException(status_code=404, detail="Фото не найдено")

    relative_path = photo.filepath.lstrip("/")
    absolute_path = os.path.join(os.path.dirname(__file__), "..", relative_path)

    if not os.path.exists(absolute_path):
        raise HTTPException(status_code=404, detail="Файл на сервере не найден")

    try:
        crop_data = get_smart_crop_box(absolute_path)
        return crop_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обработки ML: {str(e)}")