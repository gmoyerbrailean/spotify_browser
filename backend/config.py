import os

class Config(object):
    mysql_host = os.environ['MYSQL_HOST']
    mysql_db = os.environ['MYSQL_DB']
    mysql_user = os.environ['MYSQL_USER']
    mysql_password = os.environ['MYSQL_PASSWORD']
