const React = require('react');
const ReactDom = require('react-dom');
const Geolocation = require("../src/js/Geolocation");
const Configuration = require("../src/js/Configuration");

// Override configuration
Configuration.GOOGLE_MAPS_API_KEY = "AIzaSyCf-IGnyAwdo62Qae8Osa8q98phtdIkfuo";


class Demo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            locality: undefined
        }
    }

    onChangeLocality = (value) => this.setState({ locality: value });

    searchLocality = (name, latitude, longitude, cb) => {
        cb([
            {"id":"2261","name":"Leudelingen","location":{"latitude":49.5678131,"longitude":6.064118}},
            {"id":"2262","name":"Leudelingen (close)","location":{"latitude":49.5678131,"longitude":6.064119}}
        ]);
    };

    render = () => (
        <div className="demo">
            Demo page
            <br/>
            <br/>
            <label>Locality (ex: Leudelange) : </label>
            <Geolocation value={this.state.locality}
                         onChange={this.onChangeLocality}
                         search={this.searchLocality}
                         placeholder="Enter a location..."/>
        </div>
    );
}

ReactDom.render(<Demo />, document.getElementById('wrapper'));
