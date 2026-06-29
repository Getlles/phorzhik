import os
import cv2
import numpy as np
from ultralytics import YOLO

ml_models = {}

def load_ml_models():
    ml_models["yolo"] = YOLO("yolov8n.pt")


def get_smart_crop_box(image_path: str) -> dict:
    if "yolo" not in ml_models:
        load_ml_models()
        
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Не удалось загрузить изображение по пути: {image_path}")
        
    height, width, _ = img.shape
    results = ml_models["yolo"](image_path)
    boxes = results[0].boxes

    if len(boxes) == 0:
        return {
            "target_found": False,
            "box": {"x_min": 0, "y_min": 0, "x_max": width, "y_max": height},
            "img_dimensions": {"width": width, "height": height}
        }

    best_box = boxes[0]
    coords = best_box.xyxy[0].tolist()
    
    return {
        "target_found": True,
        "box": {
            "x_min": int(coords[0]),
            "y_min": int(coords[1]),
            "x_max": int(coords[2]),
            "y_max": int(coords[3])
        },
        "img_dimensions": {"width": width, "height": height}
    }


def _get_mean_and_std(x):
    x_mean, x_std = cv2.meanStdDev(x)
    return x_mean.flatten(), x_std.flatten()


def harmonize_object_with_background(object_image_path: str, background_bytes: bytes, output_path: str) -> str:
    obj_img = cv2.imread(object_image_path, cv2.IMREAD_UNCHANGED)
    bg_img = cv2.imdecode(np.frombuffer(background_bytes, np.uint8), cv2.IMREAD_COLOR)
    
    if obj_img is None or bg_img is None:
        raise ValueError("Ошибка чтения изображения объекта или фона.")
        
    if len(bg_img.shape) == 3 and bg_img.shape[2] == 4:
        bg_img = cv2.cvtColor(bg_img, cv2.COLOR_BGRA2BGR)
    elif len(bg_img.shape) == 2:
        bg_img = cv2.cvtColor(bg_img, cv2.COLOR_GRAY2BGR)
        
    if len(obj_img.shape) == 3 and obj_img.shape[2] == 4:
        b, g, r, alpha = cv2.split(obj_img)
        source_rgb = cv2.merge([b, g, r])
    elif len(obj_img.shape) == 2:
        source_rgb = cv2.cvtColor(obj_img, cv2.COLOR_GRAY2BGR)
        alpha = None
    else:
        source_rgb = obj_img
        alpha = None
        
    source_lab = cv2.cvtColor(source_rgb, cv2.COLOR_BGR2LAB).astype(np.float32)
    target_lab = cv2.cvtColor(bg_img, cv2.COLOR_BGR2LAB).astype(np.float32)
    
    s_mean, s_std = _get_mean_and_std(source_lab)
    t_mean, t_std = _get_mean_and_std(target_lab)
    
    s_std = np.where(s_std == 0, 1.0, s_std)
    
    result_lab = (source_lab - s_mean) * (t_std / s_std) + t_mean
    result_lab = np.clip(result_lab, 0, 255).astype(np.uint8)
    result_bgr = cv2.cvtColor(result_lab, cv2.COLOR_LAB2BGR)
    
    if alpha is not None:
        result_final = cv2.merge([result_bgr[:, :, 0], result_bgr[:, :, 1], result_bgr[:, :, 2], alpha])
    else:
        result_final = result_bgr
        
    cv2.imwrite(output_path, result_final)
    return output_path