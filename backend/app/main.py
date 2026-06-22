from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os

from . import models
from .database import engine, get_db
from .schemas import UserCreate, UserOut, ForgotPasswordRequest, ResetPasswordRequest, ImageOut

# Создаём таблицы (если их ещё нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Photo Editor API")

# Разрешаем запросы от фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Папка для загрузок
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")

# ---------- Эндпоинты ----------
@app.get("/")
def root():
    return {"message": "Backend is running"}

# Регистрация
@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Проверим, существует ли пользователь с таким email
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Запрос на сброс пароля – в учебном проекте просто возвращаем токен в ответе
@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    print(f"Reset token for {req.email}: {reset_token}")
    return {"message": "Reset token generated", "token": reset_token}

# Сброс пароля (без проверки токена, для упрощения)
@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Меняем пароль на новый (открытым текстом)
    user.password = req.new_password
    db.commit()
    return {"message": "Password updated successfully"}

# Загрузка изображения в галерею (требуется указать email пользователя)
@app.post("/upload", response_model=ImageOut)
async def upload_image(email: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Сохраняем файл на диск
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Записываем в БД
    image = models.Image(filename=file.filename, filepath=f"/static/uploads/{file.filename}", user_id=user.id)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

# Получение галереи пользователя
@app.get("/gallery/{email}", response_model=list[ImageOut])
def get_gallery(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.images