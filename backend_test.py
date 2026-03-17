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

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
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
                
                # Print response data for debugging
                if response.content:
                    try:
                        response_data = response.json()
                        if endpoint == "servicos/proximo-numero":
                            print(f"   Next number: {response_data.get('proximo_numero')}")
                        elif "dashboard/stats" in endpoint:
                            print(f"   Stats: Total={response_data.get('total')}, Navios={response_data.get('navios')}, Policiamentos={response_data.get('policiamentos')}")
                        elif method == 'POST' and 'servicos' in endpoint:
                            print(f"   Created service ID: {response_data.get('id')}")
                            print(f"   Service number: {response_data.get('numero_servico')}")
                    except:
                        pass
                        
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content and response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_proximo_numero(self):
        """Test getting next service number"""
        success, response = self.run_test(
            "Get Next Service Number",
            "GET",
            "servicos/proximo-numero",
            200
        )
        return success

    def test_create_navios_service(self):
        """Test creating a Navios service"""
        navios_data = {
            "tipo_formulario": "navios",
            "comando_posto": "HT",
            "data": "2024-08-15",
            "utente": "TEST SHIPPING COMPANY",
            "despacho": "TEST/2024/001",
            "numero_controlo": "CTRL001",
            "atividade": "ESCALA",
            "navio": "TEST VESSEL",
            "deslocacao_km": 5.5,
            "visita": 1,
            "p_req": 2,
            "p_imp": 0,
            "np_req": 1,
            "np_imp": 0,
            "pericias": 0,
            "agravamento": 0,
            "bote": 2.0,
            "lancha": 0,
            "moto_agua": 0,
            "viatura_4x4": 1.0,
            "moto_4": 0,
            "deslocacao": 3.0,
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
            "Create Navios Service",
            "POST",
            "servicos",
            200,
            data=navios_data
        )
        
        if success and response.get('id'):
            self.created_service_id = response['id']
            
        return success

    def test_create_policiamentos_service(self):
        """Test creating a Policiamentos service"""
        policiamentos_data = {
            "tipo_formulario": "policiamentos",
            "comando_posto": "VE",
            "data": "2024-08-16",
            "utente": "TEST EVENT ORGANIZER",
            "despacho": "POL/2024/001",
            "numero_controlo": "CTRL002",
            "atividade": "POLICIAMENTO A EVENTO",
            "navio": "",
            "deslocacao_km": 8.0,
            "pol_req_p_diurno_4h": 1,
            "pol_req_p_diurno_h": 4,
            "pol_req_p_noturno_4h": 0,
            "pol_req_p_noturno_h": 0,
            "pol_req_np_diurno_4h": 1,
            "pol_req_np_diurno_h": 2,
            "pol_req_np_noturno_4h": 0,
            "pol_req_np_noturno_h": 0,
            "pol_imp_p_diurno_4h": 0,
            "pol_imp_p_diurno_h": 0,
            "pol_imp_p_noturno_4h": 0,
            "pol_imp_p_noturno_h": 0,
            "pol_imp_np_diurno_4h": 0,
            "pol_imp_np_diurno_h": 0,
            "pol_imp_np_noturno_4h": 0,
            "pol_imp_np_noturno_h": 0,
            "pericias": 1,
            "agravamento": 25.0,
            "bote": 0,
            "lancha": 1.0,
            "moto_agua": 0,
            "viatura_4x4": 2.0,
            "moto_4": 0,
            "deslocacao": 5.0,
            "agentes": [
                {
                    "nome": "Test Police Agent 1",
                    "gdh_inicio_dia": "16/08",
                    "gdh_inicio_hora": "09:00",
                    "gdh_fim_dia": "16/08",
                    "gdh_fim_hora": "17:00",
                    "gdh_servico": "Event Security",
                    "req_p_noturno_4h": 0,
                    "req_p_diurno_4h": 1,
                    "req_p_sdf": 0,
                    "req_np_noturno_4h": 0,
                    "req_np_diurno_4h": 1,
                    "req_np_sdf": 0,
                    "imp_p_noturno_4h": 0,
                    "imp_p_diurno_4h": 0,
                    "imp_p_sdf": 0,
                    "imp_np_noturno_4h": 0,
                    "imp_np_diurno_4h": 0,
                    "imp_np_sdf": 0
                }
            ],
            "responsavel": "Test Police Responsible"
        }
        
        success, response = self.run_test(
            "Create Policiamentos Service",
            "POST",
            "servicos",
            200,
            data=policiamentos_data
        )
        
        return success

    def test_list_servicos(self):
        """Test listing all services"""
        success, response = self.run_test(
            "List All Services",
            "GET",
            "servicos",
            200
        )
        return success

    def test_list_servicos_with_filters(self):
        """Test listing services with filters"""
        # Test tipo filter
        success1, _ = self.run_test(
            "List Services - Filter by Navios",
            "GET",
            "servicos",
            200,
            params={"tipo": "navios"}
        )
        
        # Test comando filter
        success2, _ = self.run_test(
            "List Services - Filter by Comando HT",
            "GET",
            "servicos",
            200,
            params={"comando": "HT"}
        )
        
        # Test search filter
        success3, _ = self.run_test(
            "List Services - Search by Utente",
            "GET",
            "servicos",
            200,
            params={"search": "TEST"}
        )
        
        return success1 and success2 and success3

    def test_get_servico(self):
        """Test getting a specific service"""
        if not self.created_service_id:
            print("⚠️ Skipping get service test - no service created")
            return True
            
        success, response = self.run_test(
            "Get Specific Service",
            "GET",
            f"servicos/{self.created_service_id}",
            200
        )
        return success

    def test_update_servico(self):
        """Test updating a service"""
        if not self.created_service_id:
            print("⚠️ Skipping update service test - no service created")
            return True
            
        update_data = {
            "tipo_formulario": "navios",
            "comando_posto": "HT",
            "data": "2024-08-15",
            "utente": "UPDATED TEST SHIPPING COMPANY",
            "despacho": "TEST/2024/001-UPDATED",
            "numero_controlo": "CTRL001-UPD",
            "atividade": "ABASTECIMENTO",
            "navio": "UPDATED TEST VESSEL",
            "deslocacao_km": 7.5,
            "visita": 2,
            "p_req": 3,
            "p_imp": 1,
            "np_req": 2,
            "np_imp": 1,
            "pericias": 1,
            "agravamento": 10.0,
            "bote": 3.0,
            "lancha": 1.0,
            "moto_agua": 0,
            "viatura_4x4": 2.0,
            "moto_4": 0,
            "deslocacao": 4.0,
            "agentes": [
                {
                    "nome": "Updated Test Agent 1",
                    "gdh_inicio_dia": "15/08",
                    "gdh_inicio_hora": "07:00",
                    "gdh_fim_dia": "15/08",
                    "gdh_fim_hora": "15:00",
                    "visita_entrada": 2,
                    "visita_saida": 1,
                    "svc_p_req": 6,
                    "svc_p_imp": 2,
                    "svc_np_req": 4,
                    "svc_np_imp": 2
                }
            ],
            "responsavel": "Updated Test Responsible"
        }
        
        success, response = self.run_test(
            "Update Service",
            "PUT",
            f"servicos/{self.created_service_id}",
            200,
            data=update_data
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test(
            "Get Dashboard Statistics",
            "GET",
            "dashboard/stats",
            200
        )
        return success

    def test_delete_servico(self):
        """Test deleting a service"""
        if not self.created_service_id:
            print("⚠️ Skipping delete service test - no service created")
            return True
            
        success, response = self.run_test(
            "Delete Service",
            "DELETE",
            f"servicos/{self.created_service_id}",
            200
        )
        return success

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

def main():
    print("🚢 POLÍCIA MARÍTIMA API Testing Suite")
    print("=" * 50)
    
    tester = PoliciaMaritimaAPITester()
    
    # Run all tests in order
    test_results = []
    
    # Basic endpoint tests
    test_results.append(tester.test_root_endpoint())
    test_results.append(tester.test_get_proximo_numero())
    test_results.append(tester.test_dashboard_stats())
    
    # Service creation tests
    test_results.append(tester.test_create_navios_service())
    test_results.append(tester.test_create_policiamentos_service())
    
    # Service retrieval and manipulation tests
    test_results.append(tester.test_list_servicos())
    test_results.append(tester.test_list_servicos_with_filters())
    test_results.append(tester.test_get_servico())
    test_results.append(tester.test_update_servico())
    
    # Cleanup test
    test_results.append(tester.test_delete_servico())
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())