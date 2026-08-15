import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAdhyayaAPI(unittest.TestCase):
    def test_root_status(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("curriculum_generation", data["features"])
        self.assertIn("certificates", data["features"])
        self.assertIn("telemetry", data["features"])

    def test_health_check(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"], "connected")

    def test_health_stats(self):
        response = client.get("/health/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("metrics", data)
        self.assertIn("total_courses", data["metrics"])
        self.assertIn("total_users", data["metrics"])

    def test_unauthorized_courses_access(self):
        response = client.get("/courses")
        self.assertIn(response.status_code, [307, 401])


if __name__ == "__main__":
    unittest.main()
