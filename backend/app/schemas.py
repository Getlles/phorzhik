from pydantic import BaseModel, EmailStr

# Регистрация
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Ответ при успешной регистрации
class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

# Запрос на сброс пароля (только email)
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Сброс пароля (email, новый пароль)
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str

# Ответ для изображения
class ImageOut(BaseModel):
    id: int
    filename: str
    filepath: str

    class Config:
        from_attributes = True