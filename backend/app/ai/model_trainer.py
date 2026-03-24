from fraud_detection_model import FraudDetectionModel
import os

def train_model():
    print("=" * 50)
    print("FRAUD DETECTION MODEL TRAINER")
    print("=" * 50)
    
    # Initialize model
    model = FraudDetectionModel()
    
    # Generate training data
    print("\n📊 Step 1: Generating training data...")
    df = model.generate_training_data(20000)  # Generate 20,000 samples
    
    # Train model
    print("\n🤖 Step 2: Training model...")
    results = model.train(df)
    
    # Save model
    print("\n💾 Step 3: Saving model...")
    model.save_model()
    
    print("\n" + "=" * 50)
    print("✅ TRAINING COMPLETE!")
    print("=" * 50)
    print(f"\nModel Performance:")
    print(f"  - Accuracy:  {results['accuracy']:.2%}")
    print(f"  - Precision: {results['precision']:.2%}")
    print(f"  - Recall:    {results['recall']:.2%}")
    print(f"  - F1 Score:  {results['f1']:.2%}")
    
    return results

if __name__ == "__main__":
    train_model()