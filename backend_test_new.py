#!/usr/bin/env python3
"""
Maritime Police Platform Backend API Tests
Tests authentication, services, fiscalização, and dashboard functionality
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class MaritimePoliceAPITester:
    def __init__(self, base_url="https://service-logger-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make API request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            return success, response.json() if response.content else {}, response.status_code

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0
        except json.JSONDecodeError:
            return False, {"error": "Invalid JSON response"}, response.status_code

    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        print("\n🔐 Testing Authentication...")
        
        # Test HORTA login
        success, response, status = self.make_request(
            "POST", "auth/login", 
            {"username": "HORTA", "password": "HORTA123"}
        )
        
        if success and "token" in response:
            self.token = response["token"]
            self.user_data = response
            self.log_test("Login HORTA/HORTA123", True)
            return True
        else:
            self.log_test("Login HORTA/HORTA123", False, f"Status: {status}, Response: {response}")
            return False

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response, status = self.make_request(
            "POST", "auth/login", 
            {"username": "INVALID", "password": "WRONG"}, 
            expected_status=401
        )
        
        self.log_test("Login invalid credentials returns 401", success)
        return success

    def test_auth_me(self):
        """Test /auth/me endpoint"""
        if not self.token:
            self.log_test("Auth /me endpoint", False, "No token available")
            return False
            
        success, response, status = self.make_request("GET", "auth/me")
        
        if success and "username" in response:
            self.log_test("Auth /me endpoint", True)
            return True
        else:
            self.log_test("Auth /me endpoint", False, f"Status: {status}")
            return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n📊 Testing Dashboard...")
        
        success, response, status = self.make_request("GET", "dashboard/stats")
        
        if success and "total" in response and "fiscalizacoes" in response:
            self.log_test("Dashboard stats endpoint", True)
            print(f"   📈 Total services: {response.get('total', 0)}")
            print(f"   📈 Fiscalizações: {response.get('fiscalizacoes', 0)}")
            return True
        else:
            self.log_test("Dashboard stats endpoint", False, f"Status: {status}")
            return False

    def test_fiscalizacao_tipos(self):
        """Test fiscalização types endpoint"""
        print("\n🎣 Testing Fiscalização...")
        
        success, response, status = self.make_request("GET", "fiscalizacoes/tipos")
        
        expected_types = ["pesca_ludica", "caca_submarina", "pesca_profissional", "recreio", 
                         "maritimo_turistica", "operador_mt", "apanha_profissional", "tl_reb_auxl"]
        
        if success and isinstance(response, dict):
            found_types = list(response.keys())
            has_all_types = all(t in found_types for t in expected_types)
            self.log_test("Fiscalização types endpoint", has_all_types)
            print(f"   🏷️  Found {len(found_types)} activity types")
            return has_all_types
        else:
            self.log_test("Fiscalização types endpoint", False, f"Status: {status}")
            return False

    def test_fiscalizacao_proximo_numero(self):
        """Test next fiscalização number generation"""
        success, response, status = self.make_request(
            "GET", "fiscalizacoes/proximo-numero?tipo=pesca_ludica"
        )
        
        if success and "proximo_numero" in response:
            self.log_test("Fiscalização next number generation", True)
            print(f"   🔢 Next number: {response.get('proximo_numero')}")
            return True
        else:
            self.log_test("Fiscalização next number generation", False, f"Status: {status}")
            return False

    def test_create_fiscalizacao(self):
        """Test creating a fiscalização record"""
        fisc_data = {
            "tipo_atividade": "pesca_ludica",
            "data": datetime.now().strftime("%Y-%m-%d"),
            "hora": "10:30",
            "gps_n": "38 32.123",
            "gps_w": "28 38.456",
            "local": "HORTA",
            "status": "legal",
            "timoneiro_nome": "JOAO SILVA",
            "timoneiro_cc": "12345678",
            "timoneiro_nif": "123456789",
            "embarcacao_nome": "TESTE BOAT",
            "licenca_num": "PL001/2026",
            "observacoes": "TESTE AUTOMATICO"
        }
        
        success, response, status = self.make_request(
            "POST", "fiscalizacoes", fisc_data, expected_status=200
        )
        
        if success and "id" in response and "numero_fiscalizacao" in response:
            self.created_fisc_id = response["id"]
            self.log_test("Create fiscalização record", True)
            print(f"   📝 Created: {response.get('numero_fiscalizacao')}")
            return True
        else:
            self.log_test("Create fiscalização record", False, f"Status: {status}, Response: {response}")
            return False

    def test_list_fiscalizacoes(self):
        """Test listing fiscalização records"""
        success, response, status = self.make_request("GET", "fiscalizacoes")
        
        if success and isinstance(response, list):
            self.log_test("List fiscalizações", True)
            print(f"   📋 Found {len(response)} records")
            return True
        else:
            self.log_test("List fiscalizações", False, f"Status: {status}")
            return False

    def test_fiscalizacao_stats(self):
        """Test fiscalização statistics"""
        success, response, status = self.make_request("GET", "fiscalizacoes-stats")
        
        if success and "total" in response:
            self.log_test("Fiscalização statistics", True)
            print(f"   📊 Total: {response.get('total', 0)}, Legal: {response.get('legal', 0)}")
            return True
        else:
            self.log_test("Fiscalização statistics", False, f"Status: {status}")
            return False

    def test_servicos_proximo_numero(self):
        """Test next service number generation"""
        print("\n🚢 Testing Services...")
        
        success, response, status = self.make_request("GET", "servicos/proximo-numero")
        
        if success and "proximo_numero" in response:
            self.log_test("Services next number generation", True)
            print(f"   🔢 Next number: {response.get('proximo_numero')}")
            return True
        else:
            self.log_test("Services next number generation", False, f"Status: {status}")
            return False

    def test_create_servico(self):
        """Test creating a service record"""
        servico_data = {
            "tipo_formulario": "navios",
            "data": datetime.now().strftime("%Y-%m-%d"),
            "utente": "TESTE UTENTE",
            "navio": "TESTE NAVIO",
            "atividade": "TESTE ATIVIDADE",
            "deslocacao_km": 10.5,
            "visita": 1,
            "p_req": 2,
            "p_imp": 1,
            "viatura_ligeira": 1.0,
            "responsavel": "TESTE RESPONSAVEL"
        }
        
        success, response, status = self.make_request(
            "POST", "servicos", servico_data, expected_status=200
        )
        
        if success and "id" in response and "numero_controlo" in response:
            self.created_servico_id = response["id"]
            self.log_test("Create service record", True)
            print(f"   📝 Created: {response.get('numero_controlo')}")
            return True
        else:
            self.log_test("Create service record", False, f"Status: {status}, Response: {response}")
            return False

    def test_list_servicos(self):
        """Test listing service records"""
        success, response, status = self.make_request("GET", "servicos")
        
        if success and isinstance(response, list):
            self.log_test("List services", True)
            print(f"   📋 Found {len(response)} records")
            return True
        else:
            self.log_test("List services", False, f"Status: {status}")
            return False

    def test_servicos_kpi(self):
        """Test services KPI endpoint"""
        success, response, status = self.make_request("GET", "servicos-kpi")
        
        if success and "navios" in response and "policiamentos" in response:
            self.log_test("Services KPI endpoint", True)
            print(f"   📊 Navios: {response.get('navios', 0)}, Policiamentos: {response.get('policiamentos', 0)}")
            return True
        else:
            self.log_test("Services KPI endpoint", False, f"Status: {status}")
            return False

    def test_relatorio(self):
        """Test reports endpoint"""
        print("\n📄 Testing Reports...")
        
        success, response, status = self.make_request("GET", "relatorio")
        
        if success and "total" in response and "servicos" in response:
            self.log_test("Reports endpoint", True)
            print(f"   📊 Total in report: {response.get('total', 0)}")
            return True
        else:
            self.log_test("Reports endpoint", False, f"Status: {status}")
            return False

    def test_other_user_logins(self):
        """Test login with other user accounts"""
        print("\n👥 Testing Other User Accounts...")
        
        users = [
            ("PICO", "PICO123"),
            ("VELAS", "VELAS123"),
            ("ADMIN", "ADMIN123")
        ]
        
        all_passed = True
        for username, password in users:
            success, response, status = self.make_request(
                "POST", "auth/login", 
                {"username": username, "password": password}
            )
            
            if success and "token" in response:
                self.log_test(f"Login {username}", True)
                print(f"   👤 {response.get('nome', username)} - {response.get('unidade', 'N/A')}")
            else:
                self.log_test(f"Login {username}", False, f"Status: {status}")
                all_passed = False
        
        # Restore HORTA token for remaining tests
        self.test_login_valid_credentials()
        return all_passed

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Maritime Police Platform Backend API Tests")
        print(f"🌐 Backend URL: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_login_valid_credentials():
            print("❌ Login failed - stopping tests")
            return False

        self.test_login_invalid_credentials()
        self.test_auth_me()
        
        # Core functionality tests
        self.test_dashboard_stats()
        self.test_fiscalizacao_tipos()
        self.test_fiscalizacao_proximo_numero()
        self.test_create_fiscalizacao()
        self.test_list_fiscalizacoes()
        self.test_fiscalizacao_stats()
        
        self.test_servicos_proximo_numero()
        self.test_create_servico()
        self.test_list_servicos()
        self.test_servicos_kpi()
        
        self.test_relatorio()
        self.test_other_user_logins()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MaritimePoliceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())