import base64
import matplotlib.pyplot as plt
from flask import Flask

import os
from flask import request, jsonify
import tensorflow as tf 
import tensorflow_hub as hub 
import cv2 
import numpy as np
from mark_detector import MarkDetector
from pose_estimator import PoseEstimator

app = Flask(__name__)

multiple_people_detector = hub.load("https://tfhub.dev/tensorflow/efficientdet/d0/1")


def readb64(uri):
   encoded_data = uri.split(',')[1]
   nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
   img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
   img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
   return img


def get_head_direction(rotation_vector):
    """
    Analyze rotation vector to determine head direction.
    rotation_vector[0] = pitch (up/down)
    rotation_vector[1] = yaw (left/right)
    rotation_vector[2] = roll (tilt)
    """
    pitch = rotation_vector[0][0]  # X-axis rotation (up/down)
    yaw = rotation_vector[1][0]    # Y-axis rotation (left/right)
    roll = rotation_vector[2][0]   # Z-axis rotation (tilt)
    
    # Thresholds for detection (in radians, adjust as needed)
    PITCH_THRESHOLD = 0.3  # ~17 degrees
    YAW_THRESHOLD = 0.4    # ~23 degrees
    
    direction = {
        'looking_up': False,
        'looking_down': False,
        'looking_left': False,
        'looking_right': False,
        'looking_straight': True,
        'pitch': float(pitch),
        'yaw': float(yaw),
        'roll': float(roll)
    }
    
    # Check vertical direction (pitch)
    if pitch < -PITCH_THRESHOLD:
        direction['looking_up'] = True
        direction['looking_straight'] = False
    elif pitch > PITCH_THRESHOLD:
        direction['looking_down'] = True
        direction['looking_straight'] = False
    
    # Check horizontal direction (yaw)
    if yaw < -YAW_THRESHOLD:
        direction['looking_right'] = True
        direction['looking_straight'] = False
    elif yaw > YAW_THRESHOLD:
        direction['looking_left'] = True
        direction['looking_straight'] = False
    
    return direction


@app.route('/predict_pose', methods=['GET', 'POST']) 
def predict_pose(): 
    data = request.get_json(force=True) 
    image = r'{}'.format(data['img'])
    print(type(image), image)
    image = readb64(image)
    plt.imshow(image)
    
    height, width = image.shape[0], image.shape[1]
    pose_estimator = PoseEstimator(img_size=(height, width))
    mark_detector = MarkDetector()

    facebox = mark_detector.extract_cnn_facebox(image)
    frame = image
    
    if facebox is not None:
        x1, y1, x2, y2 = facebox
        face_img = frame[y1: y2, x1: x2]

        marks = mark_detector.detect_marks(face_img)

        marks *= (x2 - x1)
        marks[:, 0] += x1
        marks[:, 1] += y1

        pose = pose_estimator.solve_pose_by_68_points(marks)
        
        rotation_vector = pose[0]
        translation_vector = pose[1]
        
        # Get head direction analysis
        head_direction = get_head_direction(rotation_vector)

        img, pose_result = pose_estimator.draw_annotation_box(
            frame, rotation_vector, translation_vector, color=(0, 255, 0)
        )
        
        return jsonify({
            'status': 'face_found',
            'head_direction': head_direction,
            'pose': {
                'rotation': rotation_vector.tolist(),
                'translation': translation_vector.tolist()
            },
            'warnings': get_warnings(head_direction)
        })
    else:
        return jsonify({
            'status': 'face_not_found',
            'head_direction': None,
            'warnings': ['No face detected in frame']
        })


def get_warnings(direction):
    """Generate warning messages based on head direction."""
    warnings = []
    
    if direction['looking_up']:
        warnings.append('Student is looking UP - possible cheating detected')
    if direction['looking_down']:
        warnings.append('Student is looking DOWN - possible cheating detected')
    if direction['looking_left']:
        warnings.append('Student is looking LEFT - possible cheating detected')
    if direction['looking_right']:
        warnings.append('Student is looking RIGHT - possible cheating detected')
    
    if not warnings:
        warnings.append('Student is looking at screen - OK')
    
    return warnings


@app.route('/check_attention', methods=['GET', 'POST'])
def check_attention():
    """
    Simplified endpoint specifically for attention monitoring.
    Returns whether student is paying attention to screen.
    """
    data = request.get_json(force=True)
    image = readb64(data['img'])
    
    height, width = image.shape[0], image.shape[1]
    pose_estimator = PoseEstimator(img_size=(height, width))
    mark_detector = MarkDetector()
    
    facebox = mark_detector.extract_cnn_facebox(image)
    
    if facebox is None:
        return jsonify({
            'attention': False,
            'reason': 'no_face',
            'message': 'No face detected',
            'severity': 'high'
        })
    
    x1, y1, x2, y2 = facebox
    face_img = image[y1: y2, x1: x2]
    marks = mark_detector.detect_marks(face_img)
    
    marks *= (x2 - x1)
    marks[:, 0] += x1
    marks[:, 1] += y1
    
    pose = pose_estimator.solve_pose_by_68_points(marks)
    direction = get_head_direction(pose[0])
    
    is_attentive = direction['looking_straight']
    
    reason = 'attentive'
    severity = 'none'
    
    if direction['looking_up']:
        reason = 'looking_up'
        severity = 'medium'
    elif direction['looking_down']:
        reason = 'looking_down'
        severity = 'medium'
    elif direction['looking_left']:
        reason = 'looking_left'
        severity = 'high'
    elif direction['looking_right']:
        reason = 'looking_right'
        severity = 'high'
    
    return jsonify({
        'attention': is_attentive,
        'reason': reason,
        'direction': direction,
        'severity': severity,
        'message': 'Student is attentive' if is_attentive else f'Student is {reason.replace("_", " ")}'
    })


@app.route('/predict_people', methods=['GET', 'POST'])
def predict(): 
    data = request.get_json(force=True)
    image = readb64(data['img'])
    im_width, im_height = image.shape[0], image.shape[1]
    image = image.reshape((1, image.shape[0], image.shape[1], 3))
    
    data = multiple_people_detector(image)

    boxes = data['detection_boxes'].numpy()[0]
    classes = data['detection_classes'].numpy()[0]
    scores = data['detection_scores'].numpy()[0]

    threshold = 0.5
    people = 0
    for i in range(int(data['num_detections'][0])):
        if classes[i] == 1 and scores[i] > threshold:
            people += 1

    return jsonify({'people': int(people), 'image': 'image'})


@app.route('/save_img', methods=['GET', 'POST']) 
def save(): 
    data = request.get_json(force=True)
    image = r'{}'.format(data['img'])
    user = data['user']
    image = readb64(image)
    base_dir = os.getcwd()
    path = r"{}/images/{}.jpg".format(base_dir, user[0:-10])
    print(path)
    plt.imsave(path, image)
    return jsonify({'path': path})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)