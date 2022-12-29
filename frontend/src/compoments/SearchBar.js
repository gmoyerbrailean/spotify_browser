import React from "react";
import { Search } from "semantic-ui-react";

class SearchBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            query: '',
            loading: false,
            search_results: [],
            search_value: ''
        }
    }

    handleSearchChange = (e, data) => {

        this.setState({
            search_value: data.value
        })

        if( data.value.length > 2 ) {
            let searchApi = fetch('http://127.0.0.1:5000/api/search?type=' + this.props.type + '&query=' + data.value);

            Promise.resolve(searchApi)
            .then(value => value.json())
            .then(value => value.items.map(v => {return {title: v.name, id: v.id}}))
            .then(value => {
                this.setState({
                    search_results: value
                })
            })
        }
    }

    handleSearchSelection = (e, data) => {
        // use the callback fxn to pass the selection out of the component
        this.setState({
            search_value: data.result.title
        })
        this.props.onSearchSelect(data.result.id, data.result.title);
    }

    render() {
        const loading = this.state.loading;
        const search_results = this.state.search_results;
        const search_value = this.state.search_value;

        return(
            <Search
                loading={loading}
                placeholder="Search..."
                onSearchChange={this.handleSearchChange}
                onResultSelect={this.handleSearchSelection}
                results={search_results}
                value={search_value}
            />
        )
    }
}

export default SearchBar;