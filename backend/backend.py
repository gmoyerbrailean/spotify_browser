import logging

from flask import Flask
from flask_cors import CORS

from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

logging.getLogger('flask_cors').level = logging.DEBUG

import routes
