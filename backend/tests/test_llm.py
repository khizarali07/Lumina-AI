import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.llm_qwen import generate_script

def test_qwen_script_generation():
    topic = "The concept of quantum entanglement."
    script = generate_script(topic, max_tokens=50)
    assert len(script) > 0
    print(f"Generated Script: {script}")

if __name__ == "__main__":
    test_qwen_script_generation()
