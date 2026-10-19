import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
import app.main as m

def test_endpoints():
    db = SessionLocal()
    try:
        # 1. Root
        root = m.home()
        assert root["status"] == "online", f"Root failed: {root}"
        print(f"PASS: Root -> {root}")

        # 2. Stats overview
        stats = m.get_overview_stats(db=db)
        print(f"PASS: Stats overview -> Total txns: {stats['total_transactions']}, Avg risk: {stats['avg_risk_score']}, Fraud rate: {stats['fraud_rate']}%")

        # 3. Transactions
        txns = m.get_transactions(page=1, limit=5, db=db)
        assert "items" in txns, f"Transactions failed: {txns}"
        print(f"PASS: Transactions -> Count: {len(txns['items'])}, Total: {txns['total_count']}")

        # 4. Merchants
        merchants = m.get_merchants(db=db)
        assert len(merchants) > 0, "No merchants found"
        print(f"PASS: Merchants -> Count: {len(merchants)}, First: {merchants[0]['merchant_code']}")

        # 5. Merchant baseline
        baseline = m.get_merchant_baseline(merchant_code=merchants[0]['merchant_code'], db=db)
        assert "merchant_code" in baseline, f"Baseline failed: {baseline}"
        print(f"PASS: Baseline for {baseline['merchant_code']} -> Baseline confidence: {baseline['baseline_confidence']}%")

        # 6. Incidents
        incidents = m.get_incidents(db=db)
        print(f"PASS: Incidents -> Count: {len(incidents)}")

        # 7. Network graph
        graph = m.get_network_graph(db=db)
        assert "nodes" in graph and "links" in graph
        print(f"PASS: Network Graph -> Nodes: {len(graph['nodes'])}, Links: {len(graph['links'])}")

        # 8. Defensive actions
        actions = m.get_actions(db=db)
        print(f"PASS: Defensive Actions -> Count: {len(actions)}")

        # 9. Settings
        settings = m.get_settings(db=db)
        assert "velocity_threshold" in settings
        print(f"PASS: Settings -> Velocity threshold: {settings['velocity_threshold']}")

        # 10. Update settings
        updated = m.update_settings(m.SettingUpdateRequest(settings={"velocity_threshold": "15"}), db=db)
        assert "velocity_threshold" in updated["updated_keys"]
        print(f"PASS: Update Settings -> Updated keys: {updated['updated_keys']}")

        # 11. Simulator run
        sim_req = m.SimulatorRequest(scenario_type="DEVICE_BURST", merchant_code="M001", intensity="HIGH", count=3)
        sim_res = m.run_simulation(sim_req, db=db)
        assert sim_res["transactions_created"] == 3
        print(f"PASS: Simulator -> Injected: {sim_res['transactions_created']}, Incident: {sim_res['incident_code']}")

        # 12. AI Analyst chat
        ai_req = m.AIChatRequest(message="What are the current high-risk fraud signals?")
        ai_res = m.ai_analyst_chat(ai_req, db=db)
        assert len(ai_res["reply"]) > 0
        print(f"PASS: AI Analyst -> Response length: {len(ai_res['reply'])}, Evidence count: {len(ai_res['evidence'])}")

        # 13. Reports generate (json)
        rep_json = m.generate_report(report_type="FRAUD_SUMMARY", db=db)
        assert "summary" in rep_json
        print(f"PASS: Reports (JSON) -> Transactions: {rep_json['summary']['total_transactions_audited']}")

        print("\n=======================================================")
        print("ALL 13 BACKEND CORE FUNCTIONALITY SUITES PASSED CLEANLY!")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    test_endpoints()

