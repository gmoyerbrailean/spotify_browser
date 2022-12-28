from datetime import datetime
from datetime import timedelta

from flask import request

from backend import app
from connection import Connection

############
## /plays ##
############

@app.route('/api/plays')
def get_plays():

  connection = Connection()

  base_qry = '''
  select p.time_stamp, t.name, d.name, p.context, p.context_uri, group_concat(a.name separator ',')
  from plays as p 
    inner join tracks as t on t.id=p.tid 
    inner join devices as d on p.did=d.id
    inner join tracks__artists as ta on t.id=ta.tid
    inner join artists as a on a.id=ta.aid
  where time_stamp is not null
  group by p.time_stamp, t.name 
  order by time_stamp desc
  '''

  limit = request.args.get('limit')
  if limit:
    base_qry += 'limit ' + limit

  res = connection.exec_qry(base_qry)
  items = [{
    'date': x[0].strftime("%Y-%b-%d %H:%M:%S.%f"),
    'track': x[1],
    'device': x[2],
    'context': x[3],
    'uri': x[4],
    'artists': x[5].split(','),
    } for x in res]

  return ({ 
    'items': items, 
    'totalCount': len(items) 
    })


## API to retun the latest plays. Default behavior
## is to return the latest single track, supports
## specifying other lengths of time
##
## Supports the following query params
##  interval - length of time to return plays 
##    - day (24 hours)
##    - week (7 days)
##    - month (30 days)
##    - all (all time)
##  
@app.route('/api/plays/latest')
def get_latest_plays():

  connection = Connection()

  base_qry = '''
  select p.time_stamp, t.name, d.name, p.context, p.context_uri, group_concat(a.name separator ',')
  from plays as p 
    inner join tracks as t on t.id=p.tid 
    inner join devices as d on p.did=d.id
    inner join tracks__artists as ta on t.id=ta.tid
    inner join artists as a on a.id=ta.aid
  %s
  group by p.time_stamp, t.name 
  order by time_stamp desc
  %s
  '''

  where = ""
  param_interval = request.args.get('interval')
  if param_interval:
    
    tformat = "%Y-%m-%d %H:%M:%S.%f"
    ndays = {
      "day": 1,
      "week": 7,
      "month": 30,
      "all": 100000
    }[param_interval]
    
    cutoff = datetime.strftime(datetime.now() - timedelta(days=ndays), tformat)
    where = 'where p.time_stamp > "%s"' % cutoff
  
  # if not specifying an interval, return the latest play
  limit = "" if where else "limit 1"

  sql = base_qry % (where, limit)
  res = connection.exec_qry(sql)
  items = [{
    'date': x[0].strftime("%Y-%b-%d %H:%M:%S.%f"),
    'track': x[1],
    'device': x[2],
    'context': x[3],
    'uri': x[4],
    'artists': x[5].split(','),
    } for x in res]

  return ({ 
    'items': items, 
    'totalCount': len(items) 
    })


@app.route('/api/plays/total')
def get_play_count():

  connection = Connection()
  qry = 'select count(*) from plays'
  res = connection.exec_qry(qry)
  return({
    'total': res[0][0]
  })

@app.route('/api/plays/dates')
def get_play_dates():
  '''Returns a range of dates from the 1st play to today'''
  
  connection = Connection()
  qry = '''
    select distinct time_stamp
    from plays
    where time_stamp is not null
    order by time_stamp asc
    limit 1;
  '''
  res = connection.exec_qry(qry)
  
  start = res[0][0]
  end = datetime.today()
  dates = [datetime.strftime(start + timedelta(days=x), "%Y-%b-%d") for x in range(0, (end-start).days + 2)]

  return({
    'dates': dates
  })


##############
## /artists ##
##############

## Get all artists
@app.route('/api/artists')
def get_artists():

  connection = Connection()
  base_qry = "select id, name from artists order by name asc" ## TODO - add sort query param
  res = connection.exec_qry(base_qry)

  return ({
    'items': [ {'id': x[0], 'name': x[1]} for x in res],
    'totalCount': len(res)
  })


## Get summary data for a given artist
@app.route('/api/artists/<string:aid>/summary')
def get_artist_summary():

  return()

## Get your personal ranking for a given artist
@app.route('/api/artists/<string:aid>/rank')
def get_artist_rank(aid):

  connection = Connection()
  base_qry = '''
    select q2.num from (
      select (@row_number:=@row_number + 1) AS num, q.id
      from (
        select a.id
        from plays as p
          inner join tracks__artists as ta on p.tid = ta.tid
          inner join artists as a on ta.aid = a.id
        group by a.id
        order by count(a.id) desc
      ) as q
    ) as q2
    where q2.id = "%s";
  ''' % aid
  
  connection.exec_statement('SET @row_number = 0;')
  res = connection.exec_qry(base_qry)
  connection.exec_statement('SET @row_number = 0;')

  return({ 'rank': res[0][0] })


### get artists followers over time
@app.route('/api/artists/<string:aid>/stats')
def get_artist_followers(aid):

  connection = Connection()

  qry = '''
  select round(avg(popularity)), round(avg(followers)), DATE_FORMAT(date_logged, "%Y-%m-%d") day 
  from artists__stats 
  where aid = '{0}' 
  group by day
  '''.format(aid)

  res = connection.exec_qry(qry)

  return({
    'id': aid,
    'popularity': [int(x[0]) for x in res],
    'followers': [int(x[1]) for x in res],
    'date': [x[2] for x in res]
  })

## get tracks associated with an artist
@app.route('/api/artists/<string:aid>/tracks')
def get_artist_tracks(aid):

  connection = Connection()

  qry = '''
  select t.name, count(t.name)
  from plays p
    inner join tracks t on t.id = p.tid
    inner join tracks__artists ta on t.id = ta.tid
    inner join artists a on a.id = ta.aid
  where a.id = "{0}"
  group by t.name
  order by count(t.name) desc
  '''.format(aid)
  
  res = connection.exec_qry(qry)

  return({
    'items': [ {'name': x[0], 'count': x[1] } for x in res],
    'totalCount': len(res)
  })


## get genres associated with an artist
# @app.route('/api/artists/<string:aid>/genres')
# def get_artist_genres(aid):

#   connection = Connection()

#   genres_qry = '''
#   select g.name, date_logged
#   from artists a
#     inner join artists__genres ag on a.id = ag.aid
#     inner join genres g on ag.gid = g.id
#   where a.id = '%s'
#   order by date_logged asc
#   ''' % aid

#   genres = connection.exec_qry(genres_qry)
#   output['genres']['genres'] = [ x[0] for x in genres ]
#   output['genres']['dates'] = [ x[1].strftime("%Y-%b-%d %H:%M:%S.%f") for x in genres ]

#   return(output)

@app.route('/api/artists/total')
def get_artist_count():

  connection = Connection()
  qry = 'select count(*) from artists'
  res = connection.exec_qry(qry)
  return({
    'total': res[0][0]
  })


#############
## /tracks ##
#############

@app.route('/api/tracks/total')
def get_track_count():

  connection = Connection()
  qry = 'select count(*) from tracks'
  res = connection.exec_qry(qry)
  return({
    'total': res[0][0]
  })