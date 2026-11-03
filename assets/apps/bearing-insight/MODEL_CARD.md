# Bearing Insight — surface-cnn-v0.1

## Intended use
An executable research demonstrator of image input → CNN inference → visible pattern ranking → engineering follow-up. NOT a validated bearing failure classifier. No serviceability, root-cause or remaining-life decisions are supported.

## Data and labels
Six procedural texture labels: smooth surface, scratch/scoring, pitting-like texture, corrosion-like texture, smearing/wiping, crack-like line. These are visual appearances, not a complete failure-mechanism taxonomy. Smooth does not mean healthy. Corrosion-like colour alone does not prove corrosion.

Training: 2,400 simulated images; validation: 480; final test: 600. No real photographs enter any of these splits. Independent seeds; same rendering family. Final test seed starts at 500000, not the pilot test seed. The final held-out set is not representative of industrial images. A 35-epoch pilot with average pooling performed poorly; the final architecture uses max pooling and spatial features. Do not compare these metrics to published detection mAP.

Textures are reproducible numerical/procedural simulations with lines, pits, colour patches, local smears and branched lines, plus rotation, lighting and sensor noise. They are not physical damage simulations or photorealistic generative-model output. Seed conventions are in train.py. All classes share the same simulated background generation. These images only prove a software concept.

## Model
PyTorch CNN trained from scratch: 3×3 convolutions (3→8→16→24), ReLU, two 2×2 max-pooling stages, adaptive 4×4 average pooling, linear 384→6, softmax at inference. 64×64 RGB input normalized to [0,1]. Adam, learning rate 0.001, 70 epochs, batch 64. Lowest validation cross-entropy checkpoint selected; exact metric history is in metrics.json.

A matching dependency-free JavaScript implementation executes locally in the browser. Numerical parity is checked against PyTorch. Uploaded images are resized to 64×64, which can erase small defects. Users should crop the surface first. Softmax scores are uncalibrated. The 0.65 inconclusive threshold is a provisional UI heuristic, not a validated rejection threshold. No OOD detector or multi-label model is implemented. No model-level security against adversarial images is provided.

## Research and source audit (3 November 2026)
- User reference: https://www.scribd.com/document/55448903/Bearing-Failure-Analysis — plain engine bearing guide; context only, no figures reused.
- Fu et al. (2023), Bearing surface defect detection based on improved convolutional neural network. https://doi.org/10.3934/mbe.2023549 — visual detection research (peeling, spalling, corrosion, scratch). Model and data were not used in our training.
- Feature Enhancement-Based Few-Shot Bearing Surface Defect Image Classification Method (2025). https://doi.org/10.1007/s11063-025-11720-6 — few-shot research candidate; no dataset or weights used.
- https://github.com/alireza768/-Bearing-Defects — README advertises 500 original scratching/pitting images and a U-Net segmentation pipeline. Its linked Data.zip was downloaded and inspected. Actual archive: 1,573 JPEGs; Classification Train has 933 files, Validation 640; 16 numeric folders; folder 7 has only 33 training files. No text label mapping, masks or license file in that archive. Sampled images show engine assemblies. We did NOT infer labels from folder IDs or use this archive for training; a corrected dataset and permissions would be needed.
- https://www.sciencedirect.com/science/article/pii/S2352340921009185 — Industrial machine tool component surface defect dataset, ball screw surface pitting. Adjacent domain candidate; not used.

No third-party research images are redistributed in this package. The numeric archive is not included. Publication accessibility does not by itself grant dataset reuse rights.

## Reproduce
Install Python 3.11+ and packages in requirements.txt. From the project root run `python research/train.py`. This writes model.pt, model.json, metrics.json, synthetic samples and a numerical-parity fixture. Run `node research/test-parity.cjs`. Serve dist with `python -m http.server 8000 --directory dist`. Open http://localhost:8000. No API key needed.

## Real-data development protocol
1. Set target domain: plain engine bearing shells versus rolling-element bearings; do not silently combine them.
2. Obtain licensed photos with expert labels and specimen/acquisition-session IDs. Include clean, damaged, mixed damage, nuisance conditions and non-bearing negatives. Record mechanism certainty separately from visible appearance.
3. Deduplicate and assign all photos/crops/augmentations of a physical specimen to one split. Freeze a real-only test set, grouped by specimen and preferably by site. Avoid adjacent-frame leakage.
4. Fine-tune a pretrained CNN; compare real-only versus real plus synthetic training. Synthetic data must never enter real validation/test.
5. Report per-class precision/recall/F1, confusion matrix, confidence intervals grouped by specimen, calibration and out-of-distribution rejection. Evaluate lighting/camera and site shifts.
6. Keep synthetic augmentation only when it improves performance on an untouched real test set. Require engineering review before using predictions operationally.
