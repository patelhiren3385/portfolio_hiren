// Recorded model metrics and an executed sample from the original Bearing Insight app.
window.BEARING_INSIGHT = {
  "model": "surface-cnn-v0.1",
  "status": "SYNTHETIC ONLY \u2014 no real-image validation",
  "classes": [
    "Smooth surface",
    "Scratch / scoring",
    "Pitting-like texture",
    "Corrosion-like texture",
    "Smearing / wiping",
    "Crack-like line"
  ],
  "train_count": 2400,
  "validation_count": 480,
  "test_count": 600,
  "test_accuracy": 0.8716666666666667,
  "macro_f1": 0.8659986807834312,
  "per_class_f1": [
    0.9174311926605505,
    0.6428571428571429,
    0.8599033816425121,
    1.0,
    0.9795918367346939,
    0.7962085308056872
  ],
  "confusion_matrix": [
    [
      100,
      0,
      0,
      0,
      0,
      0
    ],
    [
      15,
      54,
      12,
      0,
      0,
      19
    ],
    [
      0,
      4,
      89,
      0,
      0,
      7
    ],
    [
      0,
      0,
      0,
      100,
      0,
      0
    ],
    [
      2,
      1,
      0,
      0,
      96,
      1
    ],
    [
      1,
      9,
      6,
      0,
      0,
      84
    ]
  ],
  "seed": 42,
  "best_epoch": 68,
  "real_training_images": 0,
  "real_test_images": 0,
  "limitations": [
    "Procedural patterns are simplified and are not photorealistic.",
    "Same-generator held-out results measure software feasibility, not industrial performance.",
    "No bearing detector or validated out-of-distribution detector.",
    "Single dominant pattern only; mixed failures unsupported.",
    "Scores are uncalibrated; root causes cannot be inferred from a photo."
  ],
  "final_test_seed": 500000,
  "source_commit": "e9cf0661c1b1868764d1c4ca90ecae5a5f86c8c1",
  "example": {
    "file": "sample-2.png",
    "sha256": "e0eea8102534cff045bb6d5e35aa3a726d1cfd89590f1bfe75611ed4d474892a",
    "reference_class": "Pitting-like texture",
    "predicted_class": "Pitting-like texture",
    "app_suggestion": "Pitting-like texture",
    "scores_are_calibrated": false,
    "scores": {
      "Smooth surface": 5.866204275405019e-33,
      "Scratch / scoring": 0.00016559786029832842,
      "Pitting-like texture": 0.9980209917756241,
      "Corrosion-like texture": 1.486194745776379e-11,
      "Smearing / wiping": 0.0018085430485813398,
      "Crack-like line": 4.867300634106978e-06
    },
    "top_three": [
      {
        "class_index": 2,
        "label": "Pitting-like texture",
        "score": 0.9980209917756241
      },
      {
        "class_index": 4,
        "label": "Smearing / wiping",
        "score": 0.0018085430485813398
      },
      {
        "class_index": 1,
        "label": "Scratch / scoring",
        "score": 0.00016559786029832842
      }
    ],
    "next_check": "Use microscopy to distinguish fatigue pits, corrosion and cavitation. Review lubrication and load history."
  }
};
