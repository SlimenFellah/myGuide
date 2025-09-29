#!/usr/bin/env python
# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev
"""
Script to generate Entity-Relationship (ER) diagram for myGuide Django project.
This script uses django-extensions and graphviz to create a visual representation
of the database schema.
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def setup_django():
    """Setup Django environment"""
    # Add the backend directory to Python path
    backend_path = Path(__file__).parent.parent / 'backend'
    sys.path.insert(0, str(backend_path))
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myguide_backend.settings')
    
    # Setup Django
    django.setup()

def install_requirements():
    """Install required packages for ER diagram generation"""
    packages = [
        'django-extensions',
        'pydot'
    ]
    
    print("Installing required packages...")
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
            return False
    return True

def generate_er_diagram():
    """Generate ER diagram using Django management command"""
    try:
        # Change to backend directory
        backend_path = Path(__file__).parent.parent / 'backend'
        os.chdir(backend_path)
        
        # Generate the ER diagram
        output_file = '../docs/er_diagram.png'
        
        # Create docs directory if it doesn't exist
        docs_dir = Path('../docs')
        docs_dir.mkdir(exist_ok=True)
        
        # Run the graph_models command
        cmd = [
            sys.executable, 'manage.py', 'graph_models',
            '--pydot',
            '--output', output_file,
            '--group-models',
            '--verbose-names',
            '--arrow-shape', 'normal',
            'authentication', 'tourism', 'trip_planner', 'chatbot', 'subscriptions'
        ]
        
        print("Generating ER diagram...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ ER diagram generated successfully: {output_file}")
            return True
        else:
            print(f"✗ Error generating ER diagram: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """Main function"""
    print("myGuide Database ER Diagram Generator")
    print("=====================================")
    
    # Setup Django
    try:
        setup_django()
        print("✓ Django environment setup complete")
    except Exception as e:
        print(f"✗ Failed to setup Django: {e}")
        return
    
    # # Install requirements
    # if not install_requirements():
    #     print("✗ Failed to install required packages")
    #     return
    
    # Generate ER diagram
    if generate_er_diagram():
        print("\n✓ ER diagram generation completed successfully!")
        print("The diagram has been saved to: docs/er_diagram.png")
    else:
        print("\n✗ ER diagram generation failed")

if __name__ == '__main__':
    main()