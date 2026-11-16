export const AIRPORT_PAGES = [
  {
    "slug": "ahmedabad-airport-taxi-service",
    "name": "Ahmedabad Airport",
    "cityName": "Ahmedabad",
    "airportName": "Sardar Vallabhbhai Patel International Airport"
  },
  {
    "slug": "mumbai-airport-taxi-service",
    "name": "Mumbai Airport",
    "cityName": "Mumbai",
    "airportName": "Chhatrapati Shivaji Maharaj International Airport"
  },
  {
    "slug": "delhi-airport-taxi-service",
    "name": "Delhi Airport",
    "cityName": "Delhi",
    "airportName": "Indira Gandhi International Airport"
  },
  {
    "slug": "jaipur-airport-taxi-service",
    "name": "Jaipur Airport",
    "cityName": "Jaipur",
    "airportName": "Jaipur International Airport"
  },
  {
    "slug": "hirasar-airport-taxi-service",
    "name": "Hirasar Airport",
    "cityName": "Hirasar",
    "airportName": "Rajkot International Airport (Hirasar)"
  },
  {
    "slug": "vadodara-airport-taxi-service",
    "name": "Vadodara Airport",
    "cityName": "Vadodara",
    "airportName": "Vadodara Airport"
  },
  {
    "slug": "surat-airport-taxi-service",
    "name": "Surat Airport",
    "cityName": "Surat",
    "airportName": "Surat International Airport"
  },
  {
    "slug": "mundra-airport-taxi-service",
    "name": "Mundra Airport",
    "cityName": "Mundra",
    "airportName": "Mundra Airport"
  },
  {
    "slug": "bhuj-airport-taxi-service",
    "name": "Bhuj Airport",
    "cityName": "Bhuj",
    "airportName": "Bhuj Airport"
  },
  {
    "slug": "udaipur-airport-taxi-service",
    "name": "Udaipur Airport",
    "cityName": "Udaipur",
    "airportName": "Maharana Pratap Airport"
  },
  {
    "slug": "jodhpur-airport-taxi-service",
    "name": "Jodhpur Airport",
    "cityName": "Jodhpur",
    "airportName": "Jodhpur Airport"
  },
  {
    "slug": "navi-mumbai-airport-taxi-service",
    "name": "Navi Mumbai Airport",
    "cityName": "Mumbai",
    "airportName": "Navi Mumbai International Airport"
  }
];

export const getAirportPage = (slug) => AIRPORT_PAGES.find((airport) => airport.slug === slug) || null;
