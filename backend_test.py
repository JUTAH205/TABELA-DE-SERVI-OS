import requests
import sys
import json
from datetime import datetime

class PoliciaMaritimaAPITester:
    def __init__(self, base_url="https://service-logger-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_service_id = None
        self.issues = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                self.issues.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                try:
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.issues.append(f"{name}: Network error - {str(e)}")
            return False, {}

    def test_get_proximo_numero(self):
        """Test getting next service number - CHANGE 2: Should return proximo_numero_controlo"""
        success, response = self.run_test(
            "GET /api/servicos/proximo-numero returns proximo_numero_controlo",
            "GET",
            "servicos/proximo-numero",
            200
        )
        if success and isinstance(response, dict):
            if "proximo_numero_controlo" in response:
                numero_controlo = response["proximo_numero_controlo"]
                current_year = datetime.now().year
                if numero_controlo.startswith(f"{current_year}/") and len(numero_controlo.split('/')) == 2:
                    print(f"   ✅ Found proximo_numero_controlo: {numero_controlo}")
                    return True
                else:
                    self.issues.append(f"proximo_numero_controlo format incorrect: {numero_controlo}")
            else:
                self.issues.append("Missing proximo_numero_controlo field")
        return False

    def test_create_navios_service(self):
        """Test creating a Navios service - CHANGE 1: Should auto-generate numero_controlo as YEAR/NNNN"""
        current_year = datetime.now().year
        navios_data = {
            "tipo_formulario": "navios",
            "comando_posto": "HT",
            "data": f"{current_year}-08-15",
            "utente": "TEST SHIPPING COMPANY",
            "despacho": "TEST/2024/001",
            "atividade": "ESCALA",
            "navio": "TEST VESSEL",
            "deslocacao_km": 5.5,
            "visita": 1,
            "p_req": 2,
            "p_imp": 0,
            "np_req": 1,
            "np_imp": 0,
            "bote": 2.0,
            "lancha": 0,
            "moto_agua": 0,
            "viatura_4x4": 1.0,
            "moto_4": 0,
            "agentes": [
                {
                    "nome": "Test Agent 1",
                    "gdh_inicio_dia": "15/08",
                    "gdh_inicio_hora": "08:00",
                    "gdh_fim_dia": "15/08",
                    "gdh_fim_hora": "12:00",
                    "visita_entrada": 1,
                    "visita_saida": 0,
                    "svc_p_req": 4,
                    "svc_p_imp": 0,
                    "svc_np_req": 2,
                    "svc_np_imp": 0
                }
            ],
            "responsavel": "Test Responsible"
        }
        
        success, response = self.run_test(
            "POST /api/servicos auto-generates numero_controlo as YEAR/NNNN",
            "POST",
            "servicos",
            200,
            data=navios_data
        )
        
        if success and response.get('id'):
            self.created_service_id = response['id']
            # Check if numero_controlo is auto-generated in YEAR/NNNN format
            numero_controlo = response.get('numero_controlo')
            if numero_controlo:
                if numero_controlo.startswith(f"{current_year}/") and len(numero_controlo.split('/')[1]) == 4:
                    print(f"   ✅ Auto-generated numero_controlo: {numero_controlo}")
                    return True
                else:
                    self.issues.append(f"numero_controlo format incorrect: {numero_controlo}")
            else:
                self.issues.append("Missing numero_controlo in response")
        return False

    def test_list_atividades(self):
        """Test GET /api/atividades returns stored activities - CHANGE 3"""
        success, response = self.run_test(
            "GET /api/atividades returns stored activities",
            "GET",
            "atividades",
            200
        )
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} activities")
            return True
        else:
            self.issues.append("GET atividades should return a list")
        return False

    def test_servicos_date_filters(self):
        """Test GET /api/servicos supports data_inicio and data_fim params - CHANGE 5"""
        current_date = datetime.now().strftime("%Y-%m-%d")
        success, response = self.run_test(
            "GET /api/servicos supports data_inicio and data_fim params",
            "GET",
            "servicos",
            200,
            params={"data_inicio": current_date, "data_fim": current_date}
        )
        if success and isinstance(response, list):
            print(f"   ✅ Date range filter returned {len(response)} services")
            return True
        else:
            self.issues.append("GET servicos date range filter failed")
        return False

    def test_relatorio_endpoint(self):
        """Test GET /api/relatorio with filters works - CHANGE 4"""
        params = {
            "tipo": "navios",
            "data_inicio": "2026-01-01",
            "data_fim": "2026-12-31"
        }
        success, response = self.run_test(
            "GET /api/relatorio with filters works",
            "GET",
            "relatorio",
            200,
            params=params
        )
        if success and isinstance(response, dict):
            expected_fields = ["total", "por_tipo", "por_posto", "servicos"]
            missing_fields = [f for f in expected_fields if f not in response]
            if not missing_fields:
                print(f"   ✅ Relatorio returned {response['total']} services")
                return True
            else:
                self.issues.append(f"GET relatorio missing fields: {missing_fields}")
        return False

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test(
            "Get Dashboard Statistics",
            "GET",
            "dashboard/stats",
            200
        )
        if success and isinstance(response, dict):
            required_fields = ["total", "navios", "policiamentos"]
            missing_fields = [f for f in required_fields if f not in response]
            if not missing_fields:
                print(f"   ✅ Dashboard stats: Total={response.get('total')}, Navios={response.get('navios')}, Policiamentos={response.get('policiamentos')}")
                return True
            else:
                self.issues.append(f"Dashboard stats missing fields: {missing_fields}")
        return False

    def test_list_servicos(self):
        """Test listing all services"""
        success, response = self.run_test(
            "List All Services",
            "GET",
            "servicos",
            200
        )
        if success and isinstance(response, list):
            print(f"   ✅ Listed {len(response)} services")
            return True
        else:
            self.issues.append("GET servicos should return a list")
        return False

    def test_delete_servico(self):
        """Test deleting a service"""
        if not self.created_service_id:
            print("⚠️ Skipping delete service test - no service created")
            return True
            
        success, response = self.run_test(
            "Delete Test Service",
            "DELETE",
            f"servicos/{self.created_service_id}",
            200
        )
        return success

def main():
    print("🚢 POLÍCIA MARÍTIMA API Testing Suite - 10 Changes Verification")
    print("=" * 60)
    
    tester = PoliciaMaritimaAPITester()
    
    # Test the specific 10 changes
    test_results = []
    
    # Backend changes to test:
    # 1. POST /api/servicos auto-generates numero_controlo as YEAR/NNNN
    # 2. GET /api/servicos/proximo-numero returns proximo_numero_controlo  
    # 3. GET /api/atividades returns stored activities
    # 4. GET /api/relatorio with filters works
    # 5. GET /api/servicos supports data_inicio and data_fim params
    
    print("\n🔍 Testing Backend Changes:")
    test_results.append(tester.test_get_proximo_numero())
    test_results.append(tester.test_create_navios_service())
    test_results.append(tester.test_list_atividades())
    test_results.append(tester.test_relatorio_endpoint())
    test_results.append(tester.test_servicos_date_filters())
    
    # Basic functionality tests
    test_results.append(tester.test_dashboard_stats())
    test_results.append(tester.test_list_servicos())
    
    # Cleanup
    if tester.created_service_id:
        tester.test_delete_servico()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.issues:
        print(f"\n❌ Issues found ({len(tester.issues)}):")
        for i, issue in enumerate(tester.issues, 1):
            print(f"   {i}. {issue}")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL BACKEND TESTS PASSED!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())