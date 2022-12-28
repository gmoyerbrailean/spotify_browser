import mysql.connector

from config import Config

class Connection(object):

  def __init__(self):
    self.host=Config.mysql_host
    self.user=Config.mysql_user
    self.password=Config.mysql_password
    self.database=Config.mysql_db
    self.connect()

  def connect(self):
    self.db = mysql.connector.connect(
      host=self.host,
      user=self.user,
      passwd=self.password,
      database=self.database
    )

  def exec_qry(self, sql):
    cursor = self.db.cursor()
    cursor.execute(sql)
    return cursor.fetchall()

  def exec_statement(self, sql):
    cursor = self.db.cursor()
    cursor.execute(sql)
    return