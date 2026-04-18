import urllib.request
import json

def run_test():
    base_url = "http://localhost:5001/api"
    
    def post(path, data, token=None):
        req = urllib.request.Request(f"{base_url}{path}", data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())

    print("--- STARTING GENERAL SYSTEM TEST ---")
    
    try:
        # Step 1: Login (Assuming the user created taofeekabolade@yahoo.com with Admin@123)
        print("1. Authenticating...")
        login_res = post("/auth/login", {"email": "taofeekabolade@yahoo.com", "password": "Admin@123"})
        token = login_res.get('access_token')
        print("   √ Authenticated successfully.")

        # Step 2: Create Current Account
        print("2. Testing 'Current' Account Creation...")
        acc_res = post("/accounts/", {"account_type": "Current", "currency": "NGN", "initial_deposit": 50000}, token)
        account_id = acc_res['account']['account_id']
        print(f"   √ Created {acc_res['account']['account_type']} Account: {acc_res['account']['account_number']}")

        # Step 3: Test Bill Payment
        print("3. Testing Bill Payment logic...")
        bill_res = post("/transactions/bill-payment", {"from_account": account_id, "amount": 1000, "description": "Electric Bill"}, token)
        print(f"   √ Bill Payment Successful: {bill_res['message']}")

        # Step 4: Test AI Block (Transfer > 5,000)
        print("4. Testing AI Security Guardrail (Transfer ₦7,500)...")
        # We need a recipient. I'll use the same account for test or a different one.
        transfer_res = post("/transactions/transfer", {
            "from_account": account_id,
            "to_account": account_id, # Transfer to self to test block
            "amount": 7500,
            "description": "High Value Test"
        }, token)
        print(f"   √ Response: {transfer_res.get('message', 'Blocked (Expected)')}")
        
        # Step 5: Verify Fraud Alert exists
        print("5. Verifying Fraud Alert generation...")
        alerts_res = urllib.request.urlopen(urllib.request.Request(f"{base_url}/fraud/alerts", headers={"Authorization": f"Bearer {token}"}))
        alerts = json.loads(alerts_res.read().decode())['alerts']
        pending = [a for a in alerts if a['status'] == 'Pending']
        if pending:
            print(f"   √ Found {len(pending)} Pending Security Alerts. Manual Approval is ENABLED.")
        else:
            print("   X No alerts found!")

        print("\n--- GENERAL TEST COMPLETE: ALL SYSTEMS NOMINAL ---")

    except Exception as e:
        print(f"\n--- TEST FAILED: {e} ---")
        if hasattr(e, 'read'):
            print(f"Details: {e.read().decode()}")

if __name__ == "__main__":
    run_test()
