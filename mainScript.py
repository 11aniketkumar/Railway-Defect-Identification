import tensorflow as tf
from ultralytics import YOLO
from tensorflow.keras.models import load_model

import os
import sys
import cv2
import shutil
import numpy as np
import matplotlib.pyplot as plt

model = YOLO('Vision//models//springDetector.pt')

model.predict('data', save_crop=True, conf=0.8, project="public", name="spring_assembly")

model = load_model('Vision//models//springClassification.h5')

crop_path = os.path.join('public','spring_assembly','crops','spring_assembly')
os.mkdir(os.path.join('public','spring_assembly','crops','missing'))

for image in os.listdir(crop_path):
    source_path = os.path.join('public','spring_assembly','crops','spring_assembly',image)
    img = cv2.imread(source_path)
    resize = tf.image.resize(img, (256,256))

    y_pred = model.predict(np.expand_dims(resize/255, 0))
    
    if y_pred < 0.5:
        shutil.copy(source_path, os.path.join('public','spring_assembly','crops','missing',image))
        print('Defect found!')

sys.exit(0)