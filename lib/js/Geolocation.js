'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _Tooltip = require('react-bootstrap/lib/Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _head2 = require('lodash/fp/head');

var _head3 = _interopRequireDefault(_head2);

var _get2 = require('lodash/fp/get');

var _get3 = _interopRequireDefault(_get2);

var _find2 = require('lodash/fp/find');

var _find3 = _interopRequireDefault(_find2);

var _flow2 = require('lodash/fp/flow');

var _flow3 = _interopRequireDefault(_flow2);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// TODO RCH : remove react-bootstrap ! (in package.json as well)


var Geolocation = function (_React$Component) {
    _inherits(Geolocation, _React$Component);

    function Geolocation(props) {
        _classCallCheck(this, Geolocation);

        var _this = _possibleConstructorReturn(this, (Geolocation.__proto__ || Object.getPrototypeOf(Geolocation)).call(this, props));

        _initialiseProps.call(_this);

        _this.state = _this.initialState();
        _this.autocompleteRef = undefined; // Reference to autocomplete input field
        _this.autocomplete = undefined; // Google Autocomplete instance

        if (!_Configuration2.default.GOOGLE_MAPS_API_KEY) console.error("No Google API key set for Geolocation (please set Geolocation.Configuration.GOOGLE_MAPS_API_KEY)");
        return _this;
    }

    _createClass(Geolocation, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            // Restrict the search to Luxembourg
            var options = {
                componentRestrictions: { 'country': 'lu' }
            };

            // Link Google autocomplete mechanism to input field
            this.autocompleteRef.value = this._getUserInputAddressFromProps(this.props);

            var GoogleMapsLoader = require('google-maps-api')({
                "key": _Configuration2.default.GOOGLE_MAPS_API_KEY,
                "language": this.props.language || _Configuration2.default.LANGUAGE
            }, ['geometry', 'places']);

            GoogleMapsLoader().then(function (maps) {
                _this2.maps = maps;
                _this2.autocomplete = new maps.places.Autocomplete(_this2.autocompleteRef, options);
                _this2.autocomplete.addListener('place_changed', _this2.onChangeAutoComplete);
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // Update state only if new value is empty or is different from current one
            if (this.autocompleteRef && (!nextProps.value || nextProps.value && nextProps.value.userInputAddress !== this.state.userInputAddress)) {
                this.setState(this.initialState(nextProps));
                // Force update autocomplete field
                this.autocompleteRef.value = this._getUserInputAddressFromProps(nextProps);
            }
        }

        /**
         * Build a Geolocation object according to API needs and pass it to onChange's parent
         */


        /**
         * Render a Select to let the user choose current place.
         * It will be only displayed if :
         *      - we found several matching localities (this.state.nearestLocalities)
         * It will be hidden if :
         *      - we're in initial rendering
         *      - user has chosen a locality and typed something new
         */

    }]);

    return Geolocation;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.initialState = function (nextProps) {
        var props = nextProps || _this3.props;
        return {
            place: undefined, // Founded place via Google autocomplete
            userInputAddress: props.value ? props.value.userInputAddress : "", // User's input
            nearestLocalities: [],
            selectedLocality: undefined,
            hideChooseSelect: false,
            showFallbackText: false
        };
    };

    this.propagateOnChange = function () {
        var validLocality = _this3.state.selectedLocality;

        if (validLocality) {
            _this3.props.onChange({
                localityId: validLocality.id,
                location: validLocality.location,
                userInputAddress: _this3.state.userInputAddress,
                gmapsAddress: _this3._getAddressFromPlace(),
                gmapsURL: _this3._getGmapsURL()
            });
        } else {
            _this3.propagateOnChangeWithNull();
        }
    };

    this.propagateOnChangeWithNull = function () {
        return _this3.props.onChange(null);
    };

    this.onChooseLocality = function (locality) {
        return _this3.setState({ selectedLocality: locality }, _this3.propagateOnChange);
    };

    this.onChangeInput = function () {
        if (_this3.state.selectedLocality) _this3.setState({
            hideChooseSelect: true,
            showFallbackText: false
        });
    };

    this.onChangeAutoComplete = function () {
        if (!_this3.autocomplete) return;

        var showFallbackText = false;
        var place = _this3.autocomplete.getPlace();
        if (place !== undefined && place.geometry !== undefined) {
            var userInput = _this3.autocompleteRef.value;
            var placeLocation = place.geometry.location;
            var placeName = (0, _flow3.default)((0, _find3.default)(function (comp) {
                return (0, _find3.default)(function (typ) {
                    return typ === "locality" || typ === "sublocality";
                })(comp.types);
            }), (0, _get3.default)("short_name"))(place.address_components);

            // If user has selected an entry which is not giving any valid locality (ex: 'Luxemburg'),
            // Fallback to Luxemburg City
            if (!placeName) {
                showFallbackText = true;
                placeName = "Luxemburg";
                place = {
                    place: {
                        formatted_address: "Luxemburg",
                        url: "https://maps.google.com/?q=Luxemburg&ftid=0x479548cd9df32c57:0x400d1d6d1056d10"
                    }
                };
                placeLocation = {
                    lat: function lat() {
                        return 49.61162100000001;
                    },
                    lng: function lng() {
                        return 6.131934600000022;
                    }
                };
            }

            _this3.setState({
                userInputAddress: userInput,
                place: place,
                showFallbackText: showFallbackText
            });

            _this3.props.search(placeName, placeLocation.lat(), placeLocation.lng(), _this3.onSearch);
        }
    };

    this.onSearch = function (nearestLocalities) {
        return _this3.setState({
            nearestLocalities: nearestLocalities,
            selectedLocality: (0, _head3.default)(nearestLocalities),
            hideChooseSelect: false
        }, _this3.propagateOnChange);
    };

    this.onBlur = function (e) {
        // Force call to 'onChange' in case of empty string
        if (e.target.value === "") _this3.propagateOnChangeWithNull();else _this3.autocompleteRef.value = _this3.state.userInputAddress; // Force value to last value to not display wrong locality
    };

    this._getUserInputAddressFromProps = function (props) {
        var userInputAddress = (0, _get3.default)("value.userInputAddress")(props) || (0, _get3.default)("value.userInputAddress")(_this3.state);
        if (userInputAddress && userInputAddress !== "") return userInputAddress;else return (0, _get3.default)("value.gmapsAddress")(_this3.props) || "";
    };

    this._getAddressFromPlace = function () {
        return (0, _get3.default)("place.formatted_address")(_this3.state) || (0, _get3.default)("value.gmapsAddress")(_this3.props) || "";
    };

    this._getGmapsURL = function () {
        return (0, _get3.default)("place.url")(_this3.state) || (0, _get3.default)("value.gmapsURL")(_this3.props) || "";
    };

    this._getChooseCityText = function () {
        return _this3.props.chooseCityText || _Configuration2.default.CHOOSE_CITY_TEXT;
    };

    this._getFallbackCityText = function () {
        return _this3.props.fallbackCityText || _Configuration2.default.FALLBACK_CITY_TEXT;
    };

    this.renderChooseSelect = function () {
        return _react2.default.createElement(
            _Tooltip2.default,
            { id: 'refine-locality-tooltip', className: 'in geolocation__refine-box', placement: 'bottom', bsClass: 'fixed-tooltip' },
            _react2.default.createElement(
                'div',
                { className: 'geolocation__refine-text u-text-center' },
                _this3._getChooseCityText()
            ),
            _react2.default.createElement(_reactSelect2.default, { name: 'City',
                className: 'city',
                value: _this3.state.selectedLocality,
                placeholder: _this3._getChooseCityText(),
                options: _this3.state.nearestLocalities,
                valueRenderer: _this3.props.valueRenderer,
                optionRenderer: _this3.props.optionRenderer,
                onChange: _this3.onChooseLocality,
                clearable: false })
        );
    };

    this.renderFallbackText = function () {
        return _react2.default.createElement(
            'div',
            { className: 'geolocation__fallback-text' },
            _this3._getFallbackCityText()
        );
    };

    this.render = function () {
        return _react2.default.createElement(
            'div',
            { className: 'geolocation' },
            _react2.default.createElement(
                'div',
                { className: "related-body form-group " + (_this3.props.error ? "error" : "") },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'col-sm-12 fullWidth' },
                        _react2.default.createElement('input', { ref: function ref(_ref) {
                                return _this3.autocompleteRef = _ref;
                            },
                            type: 'text',
                            onChange: _this3.onChangeInput,
                            onBlur: _this3.onBlur,
                            disabled: _this3.props.disabled,
                            className: _this3.props.className,
                            placeholder: _this3.props.placeholder }),
                        _this3.state.showFallbackText ? _this3.renderFallbackText() : null
                    )
                ),
                !_this3.state.hideChooseSelect && _this3.state.nearestLocalities.length > 1 ? _this3.renderChooseSelect() : null
            )
        );
    };
};

Geolocation.propTypes = {
    value: _propTypes2.default.object,
    valueRenderer: _propTypes2.default.func,
    optionRenderer: _propTypes2.default.func,
    onChange: _propTypes2.default.func,
    placeholder: _propTypes2.default.string,
    chooseCityText: _propTypes2.default.string,
    fallbackCityText: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    className: _propTypes2.default.string,
    language: _propTypes2.default.string,
    search: _propTypes2.default.func
};

Geolocation.defaultProps = {
    value: null,
    valueRenderer: function valueRenderer(locality) {
        return locality && locality.name ? locality.name : locality;
    },
    optionRenderer: function optionRenderer(locality) {
        return locality && locality.name ? locality.name : locality;
    },
    placeholder: "",
    disabled: false,
    className: "address",
    // eslint-disable-next-line
    search: function search(name, latitude, longitude) {
        var cb = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (localities) {
            return localities;
        };
    } // Search function taking locality (name + latitude + longitude) and a callback function which will returns localities
};

Geolocation.Config = _Configuration2.default;

module.exports = Geolocation;