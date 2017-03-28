const React = require('react');
const Select  = require('react-select');
// TODO RCH : remove react-bootstrap ! (in package.json as well)
const Tooltip = require("react-bootstrap/lib/Tooltip");
const _head = require("lodash/fp/head");
const _get = require("lodash/fp/get");
const _find = require("lodash/fp/find");
const _flow = require("lodash/fp/flow");

const Config = require("./Configuration");


class Geolocation extends React.Component {

    constructor(props){
        super(props);
        this.state = this.initialState();
        this.autocompleteRef = undefined;   // Reference to autocomplete input field
        this.autocomplete = undefined;      // Google Autocomplete instance

        if(!Config.GOOGLE_MAPS_API_KEY)
            console.error("No Google API key set for Geolocation (please set Geolocation.Configuration.GOOGLE_MAPS_API_KEY)");
    }

    componentDidMount() {
        // Restrict the search to Luxembourg
        let options = {
            componentRestrictions: {'country': 'lu'}
        };

        // Link Google autocomplete mechanism to input field
        this.autocompleteRef.value = this._getUserInputAddressFromProps(this.props);

        const GoogleMapsLoader = require('google-maps-api')({
            "key": Config.GOOGLE_MAPS_API_KEY,
            "language": this.props.language || Config.LANGUAGE
        }, ['geometry', 'places']);

        GoogleMapsLoader().then( ( maps ) => {
            this.maps = maps;
            this.autocomplete = new maps.places.Autocomplete(this.autocompleteRef, options);
            this.autocomplete.addListener('place_changed', this.onChangeAutoComplete);
        });
    };

    componentWillReceiveProps(nextProps) {
        // Update state only if new value is empty or is different from current one
        if(this.autocompleteRef && (!nextProps.value || (nextProps.value && nextProps.value.userInputAddress !== this.state.userInputAddress))) {
            this.setState(this.initialState(nextProps));
            // Force update autocomplete field
            this.autocompleteRef.value = this._getUserInputAddressFromProps(nextProps);
        }
    }

    initialState = (nextProps) => {
        let props = nextProps || this.props;
        return {
            place: undefined, // Founded place via Google autocomplete
            userInputAddress: props.value ? props.value.userInputAddress : "", // User's input
            nearestLocalities: [],
            selectedLocality: undefined,
            hideChooseSelect: false
        }
    };

    /**
     * Build a Geolocation object according to API needs and pass it to onChange's parent
     */
    propagateOnChange = () => {
        let validLocality = this.state.selectedLocality;

        if(validLocality) {
            this.props.onChange({
                localityId: validLocality.id,
                location: validLocality.location,
                userInputAddress: this.state.userInputAddress,
                gmapsAddress: this._getAddressFromPlace(),
                gmapsURL: this._getGmapsURL()
            });
        } else {
            this.propagateOnChangeWithNull();
        }
    };

    propagateOnChangeWithNull = () => this.props.onChange(null);

    onChooseLocality = (locality) => this.setState({ selectedLocality: locality }, this.propagateOnChange);

    onChangeInput = () => {
        if(this.state.selectedLocality)
            this.setState({ hideChooseSelect: true });
    };

    onChangeAutoComplete = () => {
        if(!this.autocomplete)
            return;

        let place = this.autocomplete.getPlace();
        if(place !== undefined && place.geometry !== undefined) {
            let userInput = this.autocompleteRef.value;
            let placeLocation = place.geometry.location;
            let placeName =  _flow(
                _find( (comp) => _find( (typ) => typ === "locality")(comp.types) ),
                _get("short_name")
            )(place.address_components);

            this.setState({
                userInputAddress: userInput,
                place: place
            });

            this.props.search(placeName, placeLocation.lat(), placeLocation.lng(), this.onSearch);
        }
    };

    onSearch = (nearestLocalities) => this.setState({
        nearestLocalities: nearestLocalities,
        selectedLocality: _head(nearestLocalities),
        hideChooseSelect: false
    }, this.propagateOnChange);

    onBlur = (e) => {
        // Force call to 'onChange' in case of empty string
        if(e.target.value === "")
            this.propagateOnChangeWithNull();
        else
            this.autocompleteRef.value = this.state.userInputAddress; // Force value to last value to not display wrong locality
    };

    _getUserInputAddressFromProps = (props) => _get("value.userInputAddress")(props) || _get("value.userInputAddress")(this.state) || "";
    _getAddressFromPlace = () => _get("place.formatted_address")(this.state) || _get("value.gmapsAddress")(this.props)  || "";
    _getGmapsURL = () => _get("place.url")(this.state) || _get("value.gmapsURL")(this.props) || "";
    _getChooseCityText = () => this.props.chooseCityText || Config.CHOOSE_CITY_TEXT;

    /**
     * Render a Select to let the user choose current place.
     * It will be only displayed if :
     *      - we found several matching localities (this.state.nearestLocalities)
     * It will be hidden if :
     *      - we're in initial rendering
     *      - user has chosen a locality and typed something new
     */
    renderChooseSelect = () => (
        <Tooltip id="refine-locality-tooltip" className="in geolocation__refine-box" placement="bottom" bsClass="fixed-tooltip">
            <div className="geolocation__refine-text u-text-center">
                { this._getChooseCityText() }
            </div>
            <Select name="City"
                    className="city"
                    value={this.state.selectedLocality}
                    placeholder={this._getChooseCityText()}
                    options={this.state.nearestLocalities}
                    valueRenderer={this.props.valueRenderer}
                    optionRenderer={this.props.optionRenderer}
                    onChange={this.onChooseLocality}
                    clearable={false}/>
        </Tooltip>
    );

    render = () => (
        <div className="geolocation">
            <div className={"related-body form-group "+(this.props.error?"error":"")}>
                <div className="row">
                    <div className="col-sm-12 fullWidth">
                        <input ref={ (ref) => this.autocompleteRef = ref }
                               type="text"
                               onChange={this.onChangeInput}
                               onBlur={this.onBlur}
                               disabled={this.props.disabled}
                               className={this.props.className}
                               placeholder={this.props.placeholder}/>
                    </div>
                </div>
                { !this.state.hideChooseSelect && this.state.nearestLocalities.length > 1 ? this.renderChooseSelect() : null }
            </div>
        </div>
    );
}

Geolocation.PropTypes = {
    value : React.PropTypes.object,
    valueRenderer : React.PropTypes.func,
    optionRenderer : React.PropTypes.func,
    onChange : React.PropTypes.func,
    placeholder: React.PropTypes.string,
    chooseCityText: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    className: React.PropTypes.string,
    language: React.PropTypes.string,
    search: React.PropTypes.func
};

Geolocation.defaultProps = {
    value: null,
    valueRenderer: (locality) => locality && locality.name ? locality.name : locality,
    optionRenderer: (locality) => locality && locality.name ? locality.name : locality,
    placeholder: "",
    disabled: false,
    className: "address",
    // eslint-disable-next-line
    search: (name, latitude, longitude, cb = (localities) => localities) => {} // Search function taking locality (name + latitude + longitude) and a callback function which will returns localities
};

Geolocation.Config = Config;

module.exports = Geolocation;