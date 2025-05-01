# import os
# import cv2
# import numpy as np
# import random
# import uuid
# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS

# # ------------------- CONFIG -------------------
# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# UPLOAD_DIR = "uploads"
# OUTPUT_DIR = "outputs"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# os.makedirs(OUTPUT_DIR, exist_ok=True)

# # ------------------- UTILITY FUNCTIONS -------------------
# def get_random_color():
#     return (random.randint(50, 255), random.randint(50, 255), random.randint(50, 255))

# def manual_threshold(image, thresh_value=127):
#     binary = np.zeros_like(image)
#     binary[image > thresh_value] = 255
#     return binary

# def connected_components(binary_image):
#     h, w = binary_image.shape
#     labels = np.zeros((h, w), dtype=np.int32)
#     label = 1
#     directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
#                   (-1, -1), (-1, 1), (1, -1), (1, 1)]

#     def dfs(x, y, label):
#         stack = [(x, y)]
#         while stack:
#             cx, cy = stack.pop()
#             if (0 <= cx < h) and (0 <= cy < w):
#                 if binary_image[cx, cy] == 255 and labels[cx, cy] == 0:
#                     labels[cx, cy] = label
#                     for dx, dy in directions:
#                         stack.append((cx + dx, cy + dy))

#     for i in range(h):
#         for j in range(w):
#             if binary_image[i, j] == 255 and labels[i, j] == 0:
#                 dfs(i, j, label)
#                 label += 1

#     return labels, label - 1

# def visualize_labels(labels, num_components):
#     h, w = labels.shape
#     output = np.zeros((h, w, 3), dtype=np.uint8)
#     colors = [get_random_color() for _ in range(num_components + 1)]
#     for y in range(h):
#         for x in range(w):
#             label = labels[y, x]
#             if label > 0:
#                 output[y, x] = colors[label]
#     return output

# def extract_shape_features(labels, num_labels):
#     features = []
#     for label in range(1, num_labels + 1):
#         points = np.argwhere(labels == label)
#         if len(points) == 0:
#             continue
#         min_y, min_x = points.min(axis=0)
#         max_y, max_x = points.max(axis=0)
#         width = max_x - min_x + 1
#         height = max_y - min_y + 1
#         aspect_ratio = width / height if height > 0 else 0
#         area = len(points)
#         rect_area = width * height if width > 0 and height > 0 else 1
#         extent = area / rect_area
#         features.append({
#             'label': label,
#             'aspect_ratio': round(aspect_ratio, 2),
#             'extent': round(extent, 2),
#             'area': area,
#             'bbox': (min_x, min_y, max_x, max_y)
#         })
#     return features

# def group_shapes(features, aspect_thresh=0.2, extent_thresh=0.2):
#     groups = []
#     for feat in features:
#         found = False
#         for group in groups:
#             ref = group['reference']
#             if (abs(feat['aspect_ratio'] - ref['aspect_ratio']) < aspect_thresh and
#                 abs(feat['extent'] - ref['extent']) < extent_thresh):
#                 group['labels'].append(feat['label'])
#                 found = True
#                 break
#         if not found:
#             groups.append({'reference': feat, 'labels': [feat['label']]})
#     return groups

# def color_shapes(labels, groups):
#     h, w = labels.shape
#     output = np.zeros((h, w, 3), dtype=np.uint8)
#     colors = [get_random_color() for _ in groups]
#     for idx, group in enumerate(groups):
#         for label in group['labels']:
#             output[labels == label] = colors[idx]
#     return output

# def draw_bounding_boxes(image, features):
#     for feat in features:
#         min_x, min_y, max_x, max_y = feat['bbox']
#         extent = feat['extent']
#         cv2.rectangle(image, (min_x, min_y), (max_x, max_y), (255, 255, 255), 2)
#         cv2.putText(image, f'{extent:.2f}', (min_x, min_y - 5),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
#     return image

# def process_image_pipeline(input_path, output_paths):
#     image = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
#     if image is None:
#         return 0, 0

#     binary_img = manual_threshold(image)
#     labeled_img, num_labels = connected_components(binary_img)
#     features = extract_shape_features(labeled_img, num_labels)
#     groups = group_shapes(features)
#     colored_components_img = visualize_labels(labeled_img, num_labels)
#     grouped_color_img = color_shapes(labeled_img, groups)
#     annotated_img = draw_bounding_boxes(grouped_color_img.copy(), features)

#     cv2.imwrite(output_paths["original"], image)
#     cv2.imwrite(output_paths["labeled"], colored_components_img)
#     cv2.imwrite(output_paths["grouped"], grouped_color_img)
#     cv2.imwrite(output_paths["boxes"], annotated_img)

#     return num_labels, len(groups)

# # ------------------- ROUTES -------------------
# @app.route("/api/process-image", methods=["HEAD"])
# def check_server():
#     # Simple endpoint to check if server is running
#     return "", 200

# @app.route("/api/process-image", methods=["POST"])
# def process_image():
#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     file = request.files["image"]
#     image_id = str(uuid.uuid4())
#     input_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
#     file.save(input_path)

#     output_paths = {
#         "original": os.path.join(OUTPUT_DIR, f"{image_id}_original.png"),
#         "labeled": os.path.join(OUTPUT_DIR, f"{image_id}_labeled.png"),
#         "grouped": os.path.join(OUTPUT_DIR, f"{image_id}_grouped.png"),
#         "boxes": os.path.join(OUTPUT_DIR, f"{image_id}_boxes.png"),
#     }

#     # components = process_image_pipeline(input_path, output_paths)

#     # # Use absolute URLs for local development
#     # base_url = request.host_url.rstrip('/')
    
#     total_components, grouped_components = process_image_pipeline(input_path, output_paths)

#     return jsonify({
#         "originalImageUrl": f"/outputs/{image_id}_original.png",
#         "resultImageUrl": f"/outputs/{image_id}_labeled.png",
#         "maskImageUrl": f"/outputs/{image_id}_grouped.png",
#         "overlayImageUrl": f"/outputs/{image_id}_boxes.png",
#         "totalComponentsFound": total_components,
#         "groupsFound": grouped_components
#     })


# @app.route("/outputs/<path:filename>")
# def serve_output(filename):
#     return send_from_directory(OUTPUT_DIR, filename)

# # ------------------- RUN -------------------
# if __name__ == "__main__":
#     print("Starting Flask server on http://localhost:8000")
#     print("CORS is enabled for all origins")
#     print("Upload directory:", os.path.abspath(UPLOAD_DIR))
#     print("Output directory:", os.path.abspath(OUTPUT_DIR))
#     app.run(host="0.0.0.0", port=8000, debug=True)




import os
import cv2
import numpy as np
import random
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ------------------- CONFIG -------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------- UTILITY FUNCTIONS -------------------
def get_random_color():
    return (random.randint(50, 255), random.randint(50, 255), random.randint(50, 255))

def manual_threshold(image, thresh_value=127):
    binary = np.zeros_like(image)
    binary[image > thresh_value] = 255
    return binary

def connected_components(binary_image):
    h, w = binary_image.shape
    labels = np.zeros((h, w), dtype=np.int32)
    label = 1
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]

    def dfs(x, y, label):
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if (0 <= cx < h) and (0 <= cy < w):
                if binary_image[cx, cy] == 255 and labels[cx, cy] == 0:
                    labels[cx, cy] = label
                    for dx, dy in directions:
                        stack.append((cx + dx, cy + dy))

    for i in range(h):
        for j in range(w):
            if binary_image[i, j] == 255 and labels[i, j] == 0:
                dfs(i, j, label)
                label += 1

    return labels, label - 1

def visualize_labels(labels, num_components):
    h, w = labels.shape
    output = np.zeros((h, w, 3), dtype=np.uint8)
    colors = [get_random_color() for _ in range(num_components + 1)]
    for y in range(h):
        for x in range(w):
            label = labels[y, x]
            if label > 0:
                output[y, x] = colors[label]
    return output

def extract_shape_features(labels, num_labels):
    features = []
    for label in range(1, num_labels + 1):
        points = np.argwhere(labels == label)
        if len(points) == 0:
            continue
        min_y, min_x = points.min(axis=0)
        max_y, max_x = points.max(axis=0)
        width = max_x - min_x + 1
        height = max_y - min_y + 1
        aspect_ratio = width / height if height > 0 else 0
        area = len(points)
        rect_area = width * height if width > 0 and height > 0 else 1
        extent = area / rect_area
        features.append({
            'label': label,
            'aspect_ratio': round(aspect_ratio, 2),
            'extent': round(extent, 2),
            'area': area,
            'bbox': (min_x, min_y, max_x, max_y)
        })
    return features

def group_shapes(features, aspect_thresh=0.2, extent_thresh=0.2):
    groups = []
    for feat in features:
        found = False
        for group in groups:
            ref = group['reference']
            if (abs(feat['aspect_ratio'] - ref['aspect_ratio']) < aspect_thresh and
                abs(feat['extent'] - ref['extent']) < extent_thresh):
                group['labels'].append(feat['label'])
                found = True
                break
        if not found:
            groups.append({'reference': feat, 'labels': [feat['label']]})
    return groups

def color_shapes(labels, groups):
    h, w = labels.shape
    output = np.zeros((h, w, 3), dtype=np.uint8)
    colors = [get_random_color() for _ in groups]
    for idx, group in enumerate(groups):
        for label in group['labels']:
            output[labels == label] = colors[idx]
    return output

def draw_bounding_boxes(image, features):
    for feat in features:
        min_x, min_y, max_x, max_y = feat['bbox']
        extent = feat['extent']
        cv2.rectangle(image, (min_x, min_y), (max_x, max_y), (255, 255, 255), 2)
        cv2.putText(image, f'{extent:.2f}', (min_x, min_y - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    return image

def process_image_pipeline(input_path, output_paths):
    image = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return 0, 0

    binary_img = manual_threshold(image)
    labeled_img, num_labels = connected_components(binary_img)
    if num_labels == 0:
        return 0, 0

    features = extract_shape_features(labeled_img, num_labels)
    groups = group_shapes(features)
    colored_components_img = visualize_labels(labeled_img, num_labels)
    grouped_color_img = color_shapes(labeled_img, groups)
    annotated_img = draw_bounding_boxes(grouped_color_img.copy(), features)

    cv2.imwrite(output_paths["original"], image)
    cv2.imwrite(output_paths["labeled"], colored_components_img)
    cv2.imwrite(output_paths["grouped"], grouped_color_img)
    cv2.imwrite(output_paths["boxes"], annotated_img)

    return num_labels, len(groups)

# ------------------- ROUTES -------------------
@app.route("/api/process-image", methods=["HEAD", "GET"])
def check_server():
    return "", 200

@app.route("/api/process-image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    image_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    file.save(input_path)

    output_paths = {
        "original": os.path.join(OUTPUT_DIR, f"{image_id}_original.png"),
        "labeled": os.path.join(OUTPUT_DIR, f"{image_id}_labeled.png"),
        "grouped": os.path.join(OUTPUT_DIR, f"{image_id}_grouped.png"),
        "boxes": os.path.join(OUTPUT_DIR, f"{image_id}_boxes.png"),
    }

    total_components, grouped_components = process_image_pipeline(input_path, output_paths)

    if total_components == 0:
        return jsonify({"error": "Image processing failed or no components detected"}), 500

    base_url = request.host_url.rstrip('/')
    return jsonify({
        "originalImageUrl": f"{base_url}/outputs/{image_id}_original.png",
        "resultImageUrl": f"{base_url}/outputs/{image_id}_labeled.png",
        "maskImageUrl": f"{base_url}/outputs/{image_id}_grouped.png",
        "overlayImageUrl": f"{base_url}/outputs/{image_id}_boxes.png",
        "totalComponentsFound": total_components,
        "groupsFound": grouped_components
    })

@app.route("/outputs/<path:filename>")
def serve_output(filename):
    return send_from_directory(OUTPUT_DIR, filename)

@app.route("/", methods=["GET", "HEAD"])
def root():
    return "Flask Component Labeling API is running.", 200

# ------------------- RUN -------------------
if __name__ == "__main__":
    print("✅ Flask server running on http://localhost:8000")
    print("🔄 CORS is enabled for all origins")
    print("📂 Upload directory:", os.path.abspath(UPLOAD_DIR))
    print("📂 Output directory:", os.path.abspath(OUTPUT_DIR))
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)


