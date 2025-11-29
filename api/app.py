import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app import app
from flask import Flask

# Vercel serverless handler
def handler(request, context):
    with app.app_context():
        return app(request.environ, lambda status, headers: [])