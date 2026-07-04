import os

def add_cors():
    services = ['auth_service', 'application_service', 'prediction_service', 'admin_service']
    for service in services:
        main_path = os.path.join('services', service, 'main.py')
        if not os.path.exists(main_path):
            continue
            
        with open(main_path, 'r') as f:
            content = f.read()

        if 'CORSMiddleware' in content:
            continue

        # Add import if missing
        if 'from fastapi.middleware.cors import CORSMiddleware' not in content:
            content = content.replace('from fastapi import FastAPI', 'from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware')
        
        # Add middleware setup right after app = FastAPI(...)
        app_declaration_end = content.find(')', content.find('app = FastAPI(')) + 1
        
        cors_setup = """

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""
        new_content = content[:app_declaration_end] + cors_setup + content[app_declaration_end:]
        
        with open(main_path, 'w') as f:
            f.write(new_content)
        print(f"Added CORS to {main_path}")

if __name__ == '__main__':
    add_cors()
