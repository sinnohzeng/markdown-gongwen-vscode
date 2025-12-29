#!/usr/bin/env python3
"""
Detect redundancy in artifacts (minimalism checker).

Usage:
    python validate-minimalism.py <artifact.yaml> [--threshold <percentage>]
"""

import sys
import yaml
from pathlib import Path
from collections import Counter

def load_yaml(file_path):
    """Load YAML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def extract_text_content(data):
    """Extract all text content from YAML structure."""
    texts = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            # Skip metadata and structural fields
            if key in ['metadata', 'validation_checklist', 'next_steps']:
                continue
            
            if isinstance(value, str) and len(value) > 10:
                texts.append(value.lower().strip())
            elif isinstance(value, (dict, list)):
                texts.extend(extract_text_content(value))
    elif isinstance(data, list):
        for item in data:
            texts.extend(extract_text_content(item))
    
    return texts

def calculate_redundancy(texts, threshold=10):
    """Calculate redundancy percentage."""
    if not texts:
        return 0.0
    
    # Count occurrences of each text
    text_counts = Counter(texts)
    
    # Find duplicates (appearing more than once)
    duplicates = {text: count for text, count in text_counts.items() if count > 1}
    
    if not duplicates:
        return 0.0
    
    # Calculate redundancy as percentage of duplicate content
    total_chars = sum(len(text) * count for text, count in text_counts.items())
    duplicate_chars = sum(len(text) * (count - 1) for text, count in duplicates.items())
    
    redundancy_percentage = (duplicate_chars / total_chars * 100) if total_chars > 0 else 0.0
    
    return redundancy_percentage

def validate_minimalism(artifact_path, threshold=10):
    """Validate artifact minimalism (check for redundancy)."""
    artifact = load_yaml(artifact_path)
    
    texts = extract_text_content(artifact)
    redundancy = calculate_redundancy(texts, threshold)
    
    if redundancy <= threshold:
        print(f"✓ {artifact_path} redundancy: {redundancy:.1f}% (threshold: {threshold}%)")
        return True
    else:
        print(f"✗ {artifact_path} redundancy: {redundancy:.1f}% exceeds threshold: {threshold}%")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-minimalism.py <artifact.yaml> [--threshold <percentage>]")
        sys.exit(1)
    
    artifact_path = Path(sys.argv[1])
    threshold = 10
    
    if "--threshold" in sys.argv:
        idx = sys.argv.index("--threshold")
        if idx + 1 < len(sys.argv):
            threshold = float(sys.argv[idx + 1])
    
    success = validate_minimalism(artifact_path, threshold)
    sys.exit(0 if success else 1)
