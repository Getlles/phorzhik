from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import shutil
import os

from . import models
from .database import engine, get_db
from .schemas import UserCreate, UserOut, ForgotPasswordRequest, ResetPasswordRequest, PhotoOut
from .ml_services import load_ml_models, get_smart_crop_box, harmonize_object_with_background

models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_ml_models()
    yield

app = FastAPI(title="Photo Editor API", lifespan=lifespan)

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
async def upload_photo(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    unique_name = f"{user_id}_{file.filename}"
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
    return user.photos

@app.post("/api/v1/predict-crop")
async def predict_crop(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = get_smart_crop_box(temp_path)
        return result 
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/v1/harmonize")
async def harmonize(object_file: UploadFile = File(...), background_file: UploadFile = File(...)):
    temp_obj_path = f"temp_obj_{object_file.filename}"
    output_path = f"result_{object_file.filename}"
    
    with open(temp_obj_path, "wb") as buffer:
        shutil.copyfileobj(object_file.file, buffer)
        
    bg_bytes = await background_file.read()
    
    try:
        harmonize_object_with_background(temp_obj_path, bg_bytes, output_path)
        return FileResponse(output_path, media_type="image/png")
    finally:
        if os.path.exists(temp_obj_path): 
            os.remove(temp_obj_path)