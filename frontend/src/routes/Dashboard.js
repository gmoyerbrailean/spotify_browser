import React from 'react';
import {Grid, Table, Placeholder} from 'semantic-ui-react';

class Dashboard extends React.Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      total_plays: 0,
      total_tracks: 0,
      total_artists: 0,
      plays_limit: 5,
      loading: 1,
      recent_plays: {}
    };

    this.updateRows = this.updateRows.bind(this);
    this.refreshTable = this.refreshTable.bind(this);
    this.updateStatsAndTable = this.updateStatsAndTable.bind(this);
  }

  updateRows(n) {
    this.setState({ 
      plays_limit: n,
      loading: 1,
    });
    this.updateStatsAndTable(n);
  }

  refreshTable() {
    const n = this.state.plays_limit;
    this.setState({ loading: 1 });
    this.updateStatsAndTable(n);
  }

  updateStatsAndTable(plays_limit) {

    let playsApi = fetch("http://127.0.0.1:5000/api/plays/total");
    let tracksApi = fetch("http://127.0.0.1:5000/api/tracks/total");
    let artistsApi = fetch("http://127.0.0.1:5000/api/artists/total");
    let recentApi = fetch("http://127.0.0.1:5000/api/plays?limit=" + plays_limit);
  
    Promise.all([playsApi, tracksApi, artistsApi, recentApi])
    .then(values => Promise.all(values.map(value => value.json())))
    .then(finalVals => {
      this.setState({
        total_plays: finalVals[0].total,
        total_tracks: finalVals[1].total,
        total_artists: finalVals[2].total,
        recent_plays: finalVals[3],
        loading: 0
      })
    })
    .catch((error) => {
      console.log(error);
    });
  }

  componentDidMount() {
    const plays_limit = this.state.plays_limit;
    this.updateStatsAndTable(plays_limit);
  }

  render() {

    const { total_plays, total_tracks, total_artists, recent_plays, plays_limit, loading } = this.state;
    
    const show_options = [5, 10, 25, 50].map(n => {
      return <span className="recent-listens-table-rows-option" key={n} onClick={this.updateRows.bind(null, n)}><span className="pseudoLink"> {n} </span></span>;
    });

    // fill the table with placeholders while waiting for data
    var table_loaders = []
    for (let index = 0; index < plays_limit; index++) {
      table_loaders.push(
        <Table.Row key={index}>
          <Table.Cell><Placeholder><Placeholder.Paragraph><Placeholder.Line /><Placeholder.Line /></Placeholder.Paragraph></Placeholder></Table.Cell>
          <Table.Cell><Placeholder><Placeholder.Paragraph><Placeholder.Line /><Placeholder.Line /></Placeholder.Paragraph></Placeholder></Table.Cell>
          <Table.Cell><Placeholder><Placeholder.Paragraph><Placeholder.Line /><Placeholder.Line /></Placeholder.Paragraph></Placeholder></Table.Cell>
        </Table.Row>
      );
    }

    return(
      <div id="music-dashboard">
          <Grid>
            <Grid.Row>
                <Grid.Column computer={8} tablet={16} mobile={16}>
                    <h2>Welcome!</h2>
                    <p>This site and the data that powers it is a labor of love years in the making.</p> 
                    <p>I listen to a *lot* of music, and like most Spotify users love Wrapped season. A few years ago while playing around with the Spotify APIs, I got the idea to start tracking my own usage, 24/7. So I wrote an app that listens for my <a href="https://developer.spotify.com/documentation/web-api/reference/#/operations/get-the-users-currently-playing-track">currently playing track</a> and saves some info to a mysql database. </p>
                    <p>The first year of this project (2018), the whole system ran locally on a spare laptop. Then I got smarter and moved the "listener" to AWS, where it's been chugging away since.</p>
                </Grid.Column>
                <Grid.Column computer={8} tablet={16} mobile={16}>
                    <h2>Summary</h2>
                    <ul>
                        <li>{total_plays ? total_plays : "..."} total plays</li>
                        <li>{total_tracks ? total_tracks : "..."} unique tracks</li>
                        <li>{total_artists ? total_artists : "..."} unique artists</li>
                    </ul>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column computer={16} tablet={16} mobile={16}>
                <h3>Recent Listens</h3>
                <div id="recent-listens-controls">
                  <span id="recent-listens-refresh" className="pseudoLink" onClick={this.refreshTable}>Refresh Table</span>
                  <span id="recent-listens-toggle" >Show: {show_options}</span>
                </div>
                <Table celled striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Date</Table.HeaderCell>
                      <Table.HeaderCell>Track</Table.HeaderCell>
                      <Table.HeaderCell>Artist</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {loading ?
                      table_loaders
                      :
                      recent_plays.items.map((play, idx) => {
                        return(
                          <Table.Row key={idx}>
                            <Table.Cell>{play.date}</Table.Cell>
                            <Table.Cell>{play.track}</Table.Cell>
                            <Table.Cell>{play.artists.join(', ')}</Table.Cell>
                          </Table.Row>
                        )
                      })
                    }
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
      </div>
    )
  }
}

export default Dashboard;